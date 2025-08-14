import {
  ApiV1WorkflowDataobjectsGetPostRequest,
  ApiV1WorkflowStartPostRequest,
  ApiV1WorkflowWaitForStateCompletionPostRequest,
  Context,
  DefaultApi,
  KeyValue,
  SearchAttribute,
  SearchAttributeValueType,
  StateCompletionOutput,
  WorkflowGetRequest,
  WorkflowGetResponse,
  WorkflowStartOptions,
  WorkflowStateOptions,
  WorkflowWaitForStateCompletionResponse,
} from "iwfidl";
import {
  ClientOptions,
  LOCAL_DEFAULT_CLIENT_OPTIONS,
} from "./client_options.ts";
import { UnregisteredWorkflowOptions } from "./unregistered_workflow_options.ts";
import { getSearchAttributeValue } from "./utils/search_attributes.ts";
import {
  SearchAttributeKeyAndType,
  WorkflowGetSearchAttributesResponse,
} from "../gen/api-schema.ts";

export class UnregisteredClient {
  #options: ClientOptions;
  #defaultApi: DefaultApi;

  constructor(defaultApi: DefaultApi, options?: ClientOptions) {
    if (!options) {
      options = LOCAL_DEFAULT_CLIENT_OPTIONS;
    }
    this.#options = options;
    this.#defaultApi = defaultApi;
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
    const encodedInput = this.#options.objectEncoder.encode(input);

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
        dataAttributes: options.initialDataAttributes.entries().map(
          ([key, value]) => {
            return {
              key,
              value: this.#options.objectEncoder.encode(value),
            };
          },
        ).toArray(),
      };
    }

    const request: ApiV1WorkflowStartPostRequest = {
      workflowStartRequest: {
        workflowId,
        iwfWorkflowType: workflowType,
        workflowTimeoutSeconds: timeoutSecs,
        iwfWorkerUrl: this.#options.workerUrl,
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

    const response = await this.#defaultApi.apiV1WorkflowStartPost(request);
    return response.workflowRunId || "workflowRunId";
  }

  signalWorkflow(
    workflowId: string,
    workflowRunId: string,
    signalChannelName: string,
    signalValue: unknown,
  ) {
    return this.#defaultApi.apiV1WorkflowSignalPost({
      workflowSignalRequest: {
        workflowId,
        workflowRunId,
        signalChannelName,
        signalValue: this.#options.objectEncoder.encode(signalValue),
      },
    });
  }

  getWorkflow(
    workflowId: string,
    workflowRunId: string,
    needsResults: boolean,
  ): Promise<WorkflowGetResponse> {
    return this.#defaultApi.apiV1WorkflowGetPost({
      workflowGetRequest: {
        workflowId,
        workflowRunId,
        needsResults,
      },
    });
  }

  async getWorkflowDataAttributes(
    workflowId: string,
    workflowRunId: string,
    keys: string[],
    useMemoForDataAttributes: boolean,
  ): Promise<Map<string, unknown>> {
    const request: ApiV1WorkflowDataobjectsGetPostRequest = {
      workflowGetDataObjectsRequest: {
        workflowId,
        workflowRunId,
        keys,
        useMemoForDataAttributes,
      },
    };
    const response = await this.#defaultApi.apiV1WorkflowDataobjectsGetPost(
      request,
    );
    const res = new Map();
    response?.objects?.forEach((kv: KeyValue) => {
      res.set(kv.key, kv.value);
    });
    return res;
  }

  getWorkflowSearchAttributes(
    workflowId: string,
    workflowRunId: string,
    keys: SearchAttributeKeyAndType[],
  ): Promise<WorkflowGetSearchAttributesResponse> {
    return this.#defaultApi.apiV1WorkflowSearchattributesGetPost({
      workflowGetSearchAttributesRequest: { workflowId, workflowRunId, keys },
    });
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

  waitForWorkflowCompletion(workflowId: string) {
    throw new Error("Method not implemented.");
  }

  async getWorkflowResults(
    workflowId: string,
    workflowRunId: string,
    withWait: boolean,
  ): Promise<StateCompletionOutput[]> {
    const workflowGetRequest: WorkflowGetRequest = {
      workflowId,
      workflowRunId,
      needsResults: withWait,
      waitTimeSeconds: withWait && !!this.#options.longPollApiMaxWaitTimeSeconds
        ? this.#options.longPollApiMaxWaitTimeSeconds
        : undefined,
    };
    let workflowGetResponse: WorkflowGetResponse;
    if (withWait) {
      workflowGetResponse = await this.#defaultApi.apiV1WorkflowGetWithWaitPost(
        {
          workflowGetRequest,
        },
      );
    } else {
      workflowGetResponse = await this.#defaultApi.apiV1WorkflowGetPost({
        workflowGetRequest,
      });
    }
    if (workflowGetResponse.workflowStatus !== "COMPLETED") {
      throw new Error(
        `Uncompleted workflow: ${workflowId}`,
      );
    }
    return workflowGetResponse.results || [];
  }

  async getWorkflowResultsAndDecode<T>(
    workflowId: string,
    workflowRunId: string,
    withWait: boolean,
    validator: <T>(v: unknown) => T,
  ): Promise<T> {
    const workflowResults = await this.getWorkflowResults(
      workflowId,
      workflowRunId,
      withWait,
    );
    const filteredResults = workflowResults.filter((res) =>
      !!res.completedStateOutput
    );
    if (workflowResults.length > 1 && filteredResults.length > 1) {
      throw new Error(
        `Workflow has more than 1 result: ${workflowResults.length} workflow results or ${filteredResults.length} non-null results`,
      );
    }
    let result;
    if (filteredResults.length === 1) {
      result = filteredResults[0];
    } else {
      result = workflowResults[0];
    }
    return validator(
      this.#options.objectEncoder.decode(result.completedStateOutput),
    );
  }

  waitForStateExecutionCompletion(
    workflowId: string,
    stateExecutionId: string,
  ): Promise<WorkflowWaitForStateCompletionResponse> {
    const request: ApiV1WorkflowWaitForStateCompletionPostRequest = {
      workflowWaitForStateCompletionRequest: {
        workflowId,
        stateExecutionId,
      },
    };
    if (this.#options.longPollApiMaxWaitTimeSeconds) {
      request.workflowWaitForStateCompletionRequest!.waitTimeSeconds =
        this.#options.longPollApiMaxWaitTimeSeconds;
    }
    return this.#defaultApi.apiV1WorkflowWaitForStateCompletionPost(request);
  }
}
