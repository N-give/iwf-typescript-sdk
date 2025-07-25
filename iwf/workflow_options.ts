import {
  IDReusePolicy,
  WorkflowAlreadyStartedOptions,
  WorkflowConfig,
  WorkflowRetryPolicy,
  // WorkflowStateOptions,
} from "iwfidl";

export type WorkflowOptions = {
  workflowIdReusePolicy?: IDReusePolicy;
  workflowCronSchedule?: string;
  workflowStartDelaySeconds?: number;
  workflowRetryPolicy?: WorkflowRetryPolicy;
  // startStateOption?: WorkflowStateOptions;
  initialSearchAttributes: Map<string, unknown>;
  initialDataAttributes: Map<string, unknown>;
  workflowConfigOverride?: WorkflowConfig;
  // usingMemoForDataAttributes?: boolean;
  waitForCompletionStateExecutionIds: string[];
  waitForCompletionStateIds: string[];
  workflowAlreadyStartedOptions?: WorkflowAlreadyStartedOptions;
};
