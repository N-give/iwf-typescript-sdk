import {
  ApiV1WorkflowStartPostRequest,
  Context,
  DefaultApi,
  SearchAttribute,
  SearchAttributeValueType,
  WorkflowStartOptions,
  WorkflowStateOptions,
} from "iwfidl";
import {
  ClientOptions,
  LOCAL_DEFAULT_CLIENT_OPTIONS,
} from "./client_options.ts";
import { UnregisteredWorkflowOptions } from "./unregistered_workflow_options.ts";
import { getSearchAttributeValue } from "./utils/search_attributes.ts";

export class UnregisteredClient {
  options: ClientOptions;
  defaultApi: DefaultApi;

  constructor(defaultApi: DefaultApi, options?: ClientOptions) {
    if (!options) {
      options = LOCAL_DEFAULT_CLIENT_OPTIONS;
    }
    this.options = options;
    this.defaultApi = defaultApi;
  }

  async startWorkflow(
    _ctx: Context,
    workflowType: string,
    startStateId: string,
    workflowId: string,
    timeoutSecs: number,
    input: unknown,
    options?: UnregisteredWorkflowOptions,
  ): Promise<string> {
    const encodedInput = this.options.objectEncoder.encode(input);

    let stateOptions: WorkflowStateOptions | undefined = {
      skipWaitUntil: true,
    };
    let workflowStartOptions: WorkflowStartOptions | undefined;
    if (options) {
      options.initialSearchAttributes.forEach((sa) => {
        // propogate error if search attributes do not match
        getSearchAttributeValue(sa);
      });
      stateOptions = options.startStateOptions;
      workflowStartOptions = {
        idReusePolicy: options.workflowIdReusePolicy,
        cronSchedule: options.workflowCronSchedule,
        workflowStartDelaySeconds: options.workflowStartDelaySeconds,
        retryPolicy: options.workflowRetryPolicy,
        searchAttributes: options.initialSearchAttributes,
      };
    }

    const request: ApiV1WorkflowStartPostRequest = {
      workflowStartRequest: {
        workflowId,
        iwfWorkflowType: workflowType,
        workflowTimeoutSeconds: timeoutSecs,
        iwfWorkerUrl: this.options.workerUrl,
        startStateId,
        // waitForCompletionStateIds?: Array<string>;
        // waitForCompletionStateExecutionIds?: Array<string>;
        stateInput: encodedInput,
        // workflowId: string;
        // iwfWorkflowType: string;
        // workflowTimeoutSeconds: number;
        // iwfWorkerUrl: string;
        // startStateId?: string;
        // waitForCompletionStateIds?: Array<string>;
        // waitForCompletionStateExecutionIds?: Array<string>;
        // stateInput?: EncodedObject;
        stateOptions,
        workflowStartOptions,
      },
    };

    console.log("start request: ", request);
    const response = await this.defaultApi.apiV1WorkflowStartPost(request);
    return response.workflowRunId || "workflowRunId";
  }

  signalWorkflow(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _signalChannelName: string,
    _signalValue: unknown,
  ) {
  }

  getWorkflowDataAttributes(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _keys: string[],
  ): Map<string, unknown> {
    throw new Error("Method not implemented.");
  }

  getWorkflowSearchAttributes(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _keyAndTypes: {
      key: string;
      valueType:
        | SearchAttributeValueType
        | undefined;
    }[],
  ): Map<string, SearchAttribute> {
    throw new Error("Method not implemented.");
  }

  skipTimerByCommandId(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _stateId: string,
    _stateExecutionNumber: number,
    _timerCommandId: string,
  ) {
    throw new Error("Method not implemented.");
  }

  skipTimerByCommandIndex(
    _ctx: Context,
    _workflowId: string,
    _workflowRunId: string,
    _stateId: string,
    _stateExecutionNumber: number,
    _timerCommandIndex: number,
  ) {
    throw new Error("Method not implemented.");
  }
}
