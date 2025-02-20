import { WorkflowRetryPolicy } from "../gen/iwfidl/src/models/WorkflowRetryPolicy.ts";
import { IDReusePolicy } from "../gen/iwfidl/src/models/IDReusePolicy.ts";

export type WorkflowOptions = {
  WorkflowIdReusePolicy: IDReusePolicy;
  WorkflowCronSchedule: string;
  WorkflowStartDelaySeconds: number;
  WorkflowRetryPolicy: WorkflowRetryPolicy;
  // InitialSearchAttributes set the initial search attributes to start a workflow
  // key is search attribute key, value much match with PersistenceSchema of the workflow definition
  // For iwfidl.DATETIME , the value can be either time.Time or a string value in format of DateTimeFormat
  InitialSearchAttributes: Map<string, unknown>;
};
