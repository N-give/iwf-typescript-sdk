import { Context } from "iwfidl";

export type WorkflowContext = {
  ctx: Context;
  workflowId: string;
  workflowRunId: string;
  stateExecutionId: string;
  attempt: number;
  workflowStartTimestampSeconds: number;
  firstAttemptTimestampSeconds: number;
};
