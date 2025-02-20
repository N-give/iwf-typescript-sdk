import { WorkflowStopType } from "../gen/iwfidl/src/models/WorkflowStopType.ts";

export type WorkflowStopOptions = {
  stopType: WorkflowStopType;
  reason: string;
};
