import {
  IDReusePolicy,
  SearchAttribute,
  WorkflowAlreadyStartedOptions,
  WorkflowConfig,
  WorkflowRetryPolicy,
  WorkflowStateOptions,
} from "iwfidl";

export type UnregisteredWorkflowOptions = {
  workflowIdReusePolicy?: IDReusePolicy;
  workflowCronSchedule?: string;
  workflowStartDelaySeconds?: number;
  workflowRetryPolicy?: WorkflowRetryPolicy;
  startStateOptions?: WorkflowStateOptions;
  initialSearchAttributes: SearchAttribute[];
  initialDataAttributes: Map<string, unknown>;
  workflowConfigOverride?: WorkflowConfig;
  usingMemoForDataAttributes?: boolean;
  waitForCompletionStateExecutionIds: string[];
  waitForCompletionStateIds: string[];
  workflowAlreadyStartedOptions?: WorkflowAlreadyStartedOptions;
};
