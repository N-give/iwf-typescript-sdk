import { PersistenceLoadingPolicy } from "../gen/iwfidl/src/models/PersistenceLoadingPolicy.ts";
import { RetryPolicy } from "../gen/iwfidl/src/models/RetryPolicy.ts";
import { WaitUntilApiFailurePolicy } from "../gen/iwfidl/src/models/WaitUntilApiFailurePolicy.ts";

import { IWorkflowState } from "./workflow_state.ts";

export type StateOptions = {
  // apply for both waitUntil and execute API
  dataAttributesLoadingPolicy: PersistenceLoadingPolicy;
  searchAttributesLoadingPolicy: PersistenceLoadingPolicy;
  // below are wait_until API specific options:
  waitUntilApiTimeoutSeconds: number;
  waitUntilApiRetryPolicy: RetryPolicy;
  waitUntilApiFailurePolicy: WaitUntilApiFailurePolicy;
  waitUntilApiDataAttributesLoadingPolicy: PersistenceLoadingPolicy;
  waitUntilApiSearchAttributesLoadingPolicy: PersistenceLoadingPolicy;
  // below are execute API specific options:
  executeApiTimeoutSeconds: number;
  executeApiRetryPolicy: RetryPolicy;
  executeApiFailureProceedState: IWorkflowState;
  executeApiDataAttributesLoadingPolicy: PersistenceLoadingPolicy;
  executeApiSearchAttributesLoadingPolicy: PersistenceLoadingPolicy;
};
