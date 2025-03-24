import { WorkflowResetType } from "iwfidl";

export type ResetWorkflowOptions = {
  resetType: WorkflowResetType;
  reason: string;
  historyEventId: number;
  historyEventTime: Date;
  stateId: string;
  stateExecutionId: string;
  skipSignalReapply?: boolean;
};
