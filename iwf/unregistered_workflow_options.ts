import {
  IDReusePolicy,
  KeyValue,
  SearchAttribute,
  WorkflowRetryPolicy,
  WorkflowStateOptions,
} from "iwfidl";

export type UnregisteredWorkflowOptions = {
  workflowIdReusePolicy: IDReusePolicy;
  workflowCronSchedule: string;
  workflowStartDelaySeconds: number;
  workflowRetryPolicy: WorkflowRetryPolicy;
  startStateOptions: WorkflowStateOptions;
  initialSearchAttributes: SearchAttribute[];
  initialDataAttributes: KeyValue[];
};
