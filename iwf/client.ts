import { Context } from "../gen/iwfidl/src/models/Context.ts";
import { ResetWorkflowOptions } from "./reset_workflow_options.ts";
import { StateCompletionOutput } from "../gen/iwfidl/src/models/StateCompletionOutput.ts";
import { WorkflowConfig } from "../gen/iwfidl/src/models/WorkflowConfig.ts";
import { WorkflowStopOptions } from "./workflow_stop_options.ts";
import { WorkflowSearchRequest } from "../gen/iwfidl/src/models/WorkflowSearchRequest.ts";
import { WorkflowSearchResponse } from "../gen/iwfidl/src/models/WorkflowSearchResponse.ts";

import { ClientOptions } from "./client_options.ts";
import { getFinalWorkflowType, IWorkflow } from "./workflow.ts";
import { UnregisteredClient } from "./unregistered_client.ts";
import { WorkflowOptions } from "./workflow_options.ts";
import { getFinalWorkflowStateId, IWorkflowState } from "./workflow_state.ts";
import { WorkflowInfo } from "./workflow_info.ts";
import { Registry } from "./registry.ts";
import { UnregisteredWorkflowOptions } from "./unregistered_workflow_options.ts";

export class Client {
  unregisteredClient: UnregisteredClient;
  registry: Registry;
  options: ClientOptions;

  constructor(
    unregisteredClient: UnregisteredClient,
    registry: Registry,
    options: ClientOptions,
  ) {
    this.unregisteredClient = unregisteredClient;
    this.registry = registry;
    this.options = options;
  }

  startWorkflow(
    _ctx: Context,
    workflow: IWorkflow,
    _workflowId: string,
    _timeoutSecs: number,
    _input: unknown,
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

    let startStartId = getFinalWorkflowStateId(startingState);
    let unregisteredOptions: UnregisteredWorkflowOptions = {
      workflowIdReusePolicy: options.workflowIdReusePolicy,
      workflowCronSchedule: options.workflowCronSchedule,
      workflowStartDelaySeconds: options.workflowStartDelaySeconds,
      workflowRetryPolicy: options.workflowRetryPolicy,
      startStateOptions: undefined,
      initialSearchAttributes: [],
    };

    return this.unregisteredClient.startWorkflow(
      _ctx,
      wfType,
      startStartId,
      _workflowId,
      _timeoutSecs,
      _input,
      unregisteredOptions,
    );
  }

  // SignalWorkflow signals a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // signalChannelName is required, signalValue is optional(for case of empty value)
  signalWorkflow(
    _ctx: Context,
    _workflow: IWorkflow,
    _workflowId: string,
    _workflowRunId: string,
    _signalChannelName: string,
    _signalValue: unknown,
  ) {
  }

  // GetWorkflowDataAttributes returns the data objects of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // keys is required to be non-empty. If you intend to return all data objects, use GetAllWorkflowDataAttributes API instead
  getWorkflowDataAttributes(
    _ctx: Context,
    _workflow: IWorkflow,
    _workflowId: string,
    _workflowRunId: string,
    _keys: string[],
  ): Map<string, unknown> {
    return new Map();
  }

  // GetWorkflowSearchAttributes returns search attributes of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  // keys is required to be non-empty. If you intend to return all data objects, use GetAllWorkflowSearchAttributes API instead
  getWorkflowSearchAttributes(
    _ctx: Context,
    _workflow: IWorkflow,
    _workflowId: string,
    _workflowRunId: string,
    _keys: string[],
  ): Map<string, unknown> {
    return new Map();
  }

  // GetAllWorkflowSearchAttributes returns all search attributes of a workflow execution
  // workflowId is required, workflowRunId is optional and default to current runId of the workflowId
  getAllWorkflowSearchAttributes(
    _ctx: Context,
    _workflow: IWorkflow,
    _workflowId: string,
    _workflowRunId: string,
  ): Map<string, unknown> {
    return new Map();
  }

  // SkipTimerByCommandId skips a timer for the state execution based on the timerCommandId
  skipTimerByCommandId(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _workflowState: IWorkflowState,
    _stateExecutionNumber: number,
    _timerCommandId: string,
  ) {
  }

  // SkipTimerByCommandIndex skips a timer for the state execution based on the timerCommandId
  skipTimerByCommandIndex(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _workflowState: IWorkflowState,
    _stateExecutionNumber: number,
    _timerCommandIndex: number,
  ) {
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
}
