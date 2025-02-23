import { Context } from "../gen/iwfidl/src/models/Context.ts";
import {
  ApiV1WorkflowStartPostRequest,
  DefaultApi,
} from "../gen/iwfidl/src/apis/DefaultApi.ts";
import { ClientOptions } from "./client_options.ts";
import { UnregisteredWorkflowOptions } from "./unregistered_workflow_options.ts";
import { getSearchAttributeValue } from "./utils/search_attributes.ts";

export class UnregisteredClient {
  options: ClientOptions;
  defaultApi: DefaultApi;

  constructor(options: ClientOptions, defaultApi: DefaultApi) {
    this.options = options;
    this.defaultApi = defaultApi;
  }

  async startWorkflow(
    ctx: Context,
    workflowType: string,
    startStateId: string,
    workflowId: string,
    timeoutSecs: number,
    input: unknown,
    options?: UnregisteredWorkflowOptions,
  ): Promise<string> {
    const encodedInput = this.options.objectEncoder.encode(input);

    const request: ApiV1WorkflowStartPostRequest = {
      workflowStartRequest: {
        workflowId,
        iwfWorkflowType: workflowType,
        workflowTimeoutSeconds: timeoutSecs,
        // iwfWorkerUrl: string;
        startStateId,
        // waitForCompletionStateIds?: Array<string>;
        // waitForCompletionStateExecutionIds?: Array<string>;
        stateInput: encodedInput,
      },
    };

    if (options !== null && options !== undefined) {
      options.initialSearchAttributes.forEach((sa) => {
        // propogate error if search attributes do not match
        getSearchAttributeValue(sa);
      });
      request.workflowStartRequest.stateOptions = options.startStateOptions;
      request.workflowStartRequest.startOptions = {
        idReusePolicy: options.workflowIdReusePolicy,
        cronSchedule: options.workflowCronSchedule,
        workflowStartDelaySeconds: options.workflowStartDelaySeconds,
        retryPolicy: options.workflowRetryPolicy,
        searchAttributes: options.initialSearchAttributes,
      };
    }

    const response = await this.defaultApi.apiV1WorkflowStartPost(request);
    return response.workflowRunId;
  }
}
