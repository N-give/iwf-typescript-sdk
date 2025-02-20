import { WorkflowResetType } from "../gen/iwfidl/src/models/WorkflowResetType.ts";

export type ResetWorkflowOptions = {
  resetType: WorkflowResetType;
  reason: string;
  historyEventId: number;
  historyEventTime: Date;
  stateId: string;
  stateExecutionId: string;
  skipSignalReapply?: boolean;
};
