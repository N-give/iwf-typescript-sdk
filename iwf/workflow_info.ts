import { WorkflowStatus } from "../gen/iwfidl/src/models/WorkflowStatus.ts";

export type WorkflowInfo = {
  status: WorkflowStatus;
  currentRunId: string;
};
