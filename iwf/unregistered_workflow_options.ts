import { IDReusePolicy } from "../gen/iwfidl/src/models/IDReusePolicy.ts";
import { SearchAttribute } from "../gen/iwfidl/src/models/SearchAttribute.ts";
import { WorkflowRetryPolicy } from "../gen/iwfidl/src/models/WorkflowRetryPolicy.ts";
import { WorkflowStateOptions } from "../gen/iwfidl/src/models/WorkflowStateOptions.ts";

export type UnregisteredWorkflowOptions = {
  workflowIdReusePolicy: IDReusePolicy;
  workflowCronSchedule: string;
  workflowStartDelaySeconds: number;
  workflowRetryPolicy: WorkflowRetryPolicy;
  startStateOptions: WorkflowStateOptions;
  initialSearchAttributes: SearchAttribute[];
};
