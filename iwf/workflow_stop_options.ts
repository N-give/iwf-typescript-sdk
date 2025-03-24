import { WorkflowStopType } from "iwfidl";

export type WorkflowStopOptions = {
  stopType: WorkflowStopType;
  reason: string;
};
