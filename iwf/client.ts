import {
  Configuration,
  Context,
  DefaultApi,
  SearchAttribute,
  SearchAttributeValueType,
  StateCompletionOutput,
  WorkflowConfig,
  WorkflowSearchRequest,
  WorkflowSearchResponse,
} from "iwfidl";
import { ResetWorkflowOptions } from "./reset_workflow_options.ts";
import { WorkflowStopOptions } from "./workflow_stop_options.ts";
import {
  ClientOptions,
  LOCAL_DEFAULT_CLIENT_OPTIONS,
} from "./client_options.ts";
import { getFinalWorkflowType, IWorkflow } from "./workflow.ts";
import { UnregisteredClient } from "./unregistered_client.ts";
import { WorkflowOptions } from "./workflow_options.ts";
import { getFinalWorkflowStateId, IWorkflowState } from "./workflow_state.ts";
import { WorkflowInfo } from "./workflow_info.ts";
import { Registry } from "./registry.ts";
import { UnregisteredWorkflowOptions } from "./unregistered_workflow_options.ts";
import { toIdlStateOptions } from "./utils/state_options.ts";
import { shouldSkipWaitUntilApi } from "./utils/workflow_state.ts";
import { getSearchAttributeValue } from "./utils/search_attributes.ts";
import { RPC } from "./rpc.ts";

export class Client {
  unregisteredClient: UnregisteredClient;
  registry: Registry;
  options: ClientOptions;

  constructor(
    registry: Registry,
    options?: ClientOptions,
  ) {
    if (!options) {
      options = LOCAL_DEFAULT_CLIENT_OPTIONS;
    }
    const configuration = new Configuration({
      basePath: options.serverUrl,
      // fetchApi?: FetchAPI;
      // middleware?: Middleware[];
      // queryParamsStringify?: (params: HTTPQuery) => string;
      // username?: string;
      // password?: string;
      // apiKey?: string | Promise<string> | ((name: string) => string | Promise<string>);
      // accessToken?: string | Promise<string> | ((name?: string, scopes?: string[]) => string | Promise<string>);
      // headers?: HTTPHeaders;
      // credentials?: RequestCredentials;
    });
    const defaultApi = new DefaultApi(configuration);
    this.registry = registry;
    this.options = options;
    this.unregisteredClient = new UnregisteredClient(defaultApi, options);
  }

  startWorkflow(
    ctx: Context,
    workflow: IWorkflow,
    workflowId: string,
    timeoutSecs: number,
    input: unknown,
    options: WorkflowOptions,
  ): Promise<string> {
    const wfType = getFinalWorkflowType(workflow);
    const wf = this.registry.getWorkflow(wfType);
    if (wf === null || wf === undefined) {
      throw new Error("Worflow is not registered");
    }

    const startingState = this.registry.getWorkflowStartingState(wfType);
    if (startingState === null || startingState === undefined) {
      throw new Error(`workflow ${wfType} does not have a starting state`);
    }

    const startStartId = getFinalWorkflowStateId(startingState);
    const saTypes = this.registry.getSearchAttributeTypeStore(wfType) ||
      new Map();
    const unregisteredOptions: UnregisteredWorkflowOptions = {
      workflowIdReusePolicy: options.workflowIdReusePolicy,
      workflowCronSchedule: options.workflowCronSchedule,
      workflowStartDelaySeconds: options.workflowStartDelaySeconds,
      workflowRetryPolicy: options.workflowRetryPolicy,
      startStateOptions: toIdlStateOptions(
        shouldSkipWaitUntilApi(startingState),
        startingState.getStateOptions(),
      ),
      initialSearchAttributes: this.convertToSearchAttributeList(
        saTypes,
        options.initialSearchAttributes,
      ),
    };

    return this.unregisteredClient.startWorkflow(
      ctx,
      wfType,
      startStartId,
      workflowId,
      timeoutSecs,
      input,
      unregisteredOptions,
    );
  }

  // SignalWorkflow signals a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // signalChannelName is required, signalValue is optional(for case of empty value)
  signalWorkflow(
    ctx: Context,
    workflow: IWorkflow,
    workflowId: string,
    workflowRunId: string,
    signalChannelName: string,
    signalValue: unknown,
  ) {
    const wfType = getFinalWorkflowType(workflow);
    const signalNameStore = this.registry.getSignalNameStore(wfType);
    if (!signalNameStore?.has(signalChannelName)) {
      throw new Error(
        `signal channel ${signalChannelName} is not defined in workflow type ${wfType}`,
      );
    }
    return this.unregisteredClient.signalWorkflow(
      ctx,
      workflowId,
      workflowRunId,
      signalChannelName,
      signalValue,
    );
  }

  // GetWorkflowDataAttributes returns the data objects of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // keys is required to be non-empty. If you intend to return all data objects, use GetAllWorkflowDataAttributes API instead
  getWorkflowDataAttributes(
    ctx: Context,
    workflow: IWorkflow,
    workflowId: string,
    workflowRunId: string,
    keys: string[],
  ): Map<string, unknown> {
    const wfType = getFinalWorkflowType(workflow);
    const typeMap = this.registry.getWorkflowDataAttributesKeyStore(wfType);
    keys.forEach((key) => {
      if (!typeMap?.has(key)) {
        throw new Error(`data object type ${key} is not registered`);
      }
    });
    return this.unregisteredClient.getWorkflowDataAttributes(
      ctx,
      workflowId,
      workflowRunId,
      keys,
    );
  }

  // GetWorkflowSearchAttributes returns search attributes of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // keys is required to be non-empty. If you intend to return all data objects, use GetAllWorkflowSearchAttributes API instead
  getWorkflowSearchAttributes(
    ctx: Context,
    workflow: IWorkflow,
    workflowId: string,
    workflowRunId: string,
    keys: string[],
  ): Map<string, unknown> {
    const wfType = getFinalWorkflowType(workflow);
    const typeMap = this.registry.getSearchAttributeTypeStore(wfType);
    if (!typeMap) {
      throw new Error(`workflow type ${wfType} is not regestered`);
    }
    const keyAndTypes = Array.from(
      keys
        .filter((key) => typeMap.get(key))
        .map((key) => {
          return {
            key,
            valueType: typeMap.get(key),
          };
        }),
    );
    const vals = this.unregisteredClient.getWorkflowSearchAttributes(
      ctx,
      workflowId,
      workflowRunId,
      keyAndTypes,
    );
    return new Map(
      vals.entries().map(([k, v]) => [
        k,
        getSearchAttributeValue(v),
      ]),
    );
  }

  // GetAllWorkflowSearchAttributes returns all search attributes of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  getAllWorkflowSearchAttributes(
    ctx: Context,
    workflow: IWorkflow,
    workflowId: string,
    workflowRunId: string,
  ): Map<string, unknown> {
    const wfType = getFinalWorkflowType(workflow);
    const typeMap = this.registry.getSearchAttributeTypeStore(wfType);
    if (!typeMap) {
      throw new Error(`workflow type ${wfType} is not regestered`);
    }
    const keys = Array.from(typeMap.keys());
    return this.getWorkflowSearchAttributes(
      ctx,
      workflow,
      workflowId,
      workflowRunId,
      keys,
    );
  }

  // SkipTimerByCommandId skips a timer for the state execution based on the timerCommandId
  skipTimerByCommandId(
    ctx: Context,
    workflowId: string,
    workflowRunId: string,
    workflowState: IWorkflowState,
    stateExecutionNumber: number,
    timerCommandId: string,
  ) {
    const stateId = getFinalWorkflowStateId(workflowState);
    return this.unregisteredClient.skipTimerByCommandId(
      ctx,
      workflowId,
      workflowRunId,
      stateId,
      stateExecutionNumber,
      timerCommandId,
    );
  }

  // SkipTimerByCommandIndex skips a timer for the state execution based on the timerCommandId
  skipTimerByCommandIndex(
    ctx: Context,
    workflowId: string,
    workflowRunId: string,
    workflowState: IWorkflowState,
    stateExecutionNumber: number,
    timerCommandIndex: number,
  ) {
    const stateId = getFinalWorkflowStateId(workflowState);
    return this.unregisteredClient.skipTimerByCommandIndex(
      ctx,
      workflowId,
      workflowRunId,
      stateId,
      stateExecutionNumber,
      timerCommandIndex,
    );
  }

  // InvokeRPC invokes an RPC
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // rpc is required
  // input and outputPtr are optional
  invokeRPC(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _rpc: RPC,
    _input: unknown,
    _outputPtr: unknown,
  ) {
  }

  // StopWorkflow stops a workflow execution.
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // options is optional, default (when nil)to use Cancel as stopType
  stopWorkflow(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _options: WorkflowStopOptions,
  ) {
  }

  // UpdateWorkflowConfig updates the config of a workflow
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  updateWorkflowConfig(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _config: WorkflowConfig,
  ) {}

  // GetSimpleWorkflowResult returns the result of a workflow execution, for simple case that only one WorkflowState completes with result
  // If there are more than one WorkflowStates complete with result, GetComplexWorkflowResults must be used instead
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // resultPtr is the pointer to retrieve the result
  getSimpleWorkflowResult(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
  ): unknown {
    return {};
  }

  // GetComplexWorkflowResults returns the results of a workflow execution
  // It returns a list of iwfidl.StateCompletionOutput and user code will have to use ObjectEncoder to deserialize
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  getComplexWorkflowResults(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
  ): StateCompletionOutput[] {
    return [];
  }

  // ResetWorkflow resets a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // resetWorkflowTypeAndOptions is optional, it provides combination parameter for reset. Default (when nil) will reset to iwfidl.BEGINNING resetType
  // return the workflowRunId
  resetWorkflow(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _options: ResetWorkflowOptions,
  ): string {
    return "";
  }

  // DescribeWorkflow describes the basic info of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  describeWorkflow(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
  ): WorkflowInfo {
    return {
      status: "RUNNING",
      currentRunId: "",
    };
  }

  // SearchWorkflow searches for workflow executions given a query (see SearchAttribute query in Cadence/Temporal)
  //  https://cadenceworkflow.io/docs/concepts/search-workflows/
  //  https://docs.temporal.io/concepts/what-is-a-search-attribute/
  searchWorkflow(
    _ctx: Context,
    _request: WorkflowSearchRequest,
  ): WorkflowSearchResponse {
    return {};
  }

  // GetAllWorkflowDataAttributes returns all the data objects of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  getAllWorkflowDataAttributes(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
  ): Map<string, unknown> {
    return new Map();
  }

  convertToSearchAttributeList(
    types: Map<string, SearchAttributeValueType>,
    attributes: Map<string, unknown>,
  ): SearchAttribute[] {
    return Array.from(
      attributes.entries().map(([key, value]) => {
        const t = types.get(key);
        if (!t) {
          throw new Error(`key ${key} is not defined as search attribute`);
        }
        switch (t) {
          case SearchAttributeValueType.Int:
            if (typeof value !== "number" || !Number.isInteger(value)) {
              throw new Error(
                `Attribute, ${key}, value, ${value} does not match registered of ${t}`,
              );
            }
            return {
              key,
              integerValue: value,
            };

          case SearchAttributeValueType.Double:
            if (typeof value !== "number") {
              throw new Error(
                `Attribute, ${key}, value, ${value} does not match registered of ${t}`,
              );
            }
            return {
              key,
              doubleValue: value,
            };

          case SearchAttributeValueType.Bool:
            if (typeof value !== "boolean") {
              throw new Error(
                `Attribute, ${key}, value, ${value} does not match registered of ${t}`,
              );
            }
            return {
              key,
              boolValue: value,
            };

          case SearchAttributeValueType.Keyword, SearchAttributeValueType.Text:
            if (typeof value !== "string") {
              throw new Error(
                `Attribute, ${key}, value, ${value} does not match registered type ${t}`,
              );
            }
            return {
              key,
              stringValue: value,
            };

          case SearchAttributeValueType.Datetime:
            if (typeof value !== "object" || !(value instanceof Date)) {
              throw new Error(
                `Attribute, ${key}, value, ${value} does not match registered type ${t}`,
              );
            }
            return {
              key,
              stringValue: value.toLocaleString(),
            };

          default:
            throw new Error(`unsupported search attribute type ${t}`);
        }
      }),
    );
  }
}
