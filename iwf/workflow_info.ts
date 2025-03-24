import { WorkflowStatus } from "iwfidl";

export type WorkflowInfo = {
  status: WorkflowStatus;
  currentRunId: string;
};
