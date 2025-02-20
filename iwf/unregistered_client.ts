import { Context } from "../gen/iwfidl/src/models/Context.ts";
import { DefaultApi } from "../gen/iwfidl/src/apis/DefaultApi.ts";
import { ClientOptions } from "./client_options.ts";
import { UnregisteredWorkflowOptions } from "./unregistered_workflow_options.ts";
import { WorkflowStateOptions } from "../gen/iwfidl/src/models/WorkflowStateOptions.ts";
import { WorkflowStartOptions } from "../gen/iwfidl/src/models/WorkflowStartOptions.ts";

export class UnregisteredClient {
  options: ClientOptions;
  defaultApi: DefaultApi;

  constructor(options: ClientOptions, defaultApi: DefaultApi) {
    this.options = options;
    this.defaultApi = defaultApi;
  }

  startWorkflow(
    ctx: Context,
    workflowType: string,
    startStateId: string,
    workflowId: string,
    timeoutSecs: number,
    input: unknown,
    options?: UnregisteredWorkflowOptions,
  ): string {
    const encodedInput = this.options.objectEncoder.encode(input);
    let stateOptions: WorkflowStateOptions;
    let startOptions: WorkflowStartOptions;
    if (options !== null && options !== undefined) {
      stateOptions = options.startStateOptions;
      startOptions = {
        idReusePolicy: options.workflowIdReusePolicy,
        cronSchedule: options.workflowCronSchedule,
        workflowStartDelaySeconds: options.workflowStartDelaySeconds,
        retryPolicy: options.workflowRetryPolicy,
        searchAttributes: options.initialSearchAttributes,
      };
    }
    return "";
  }
}
