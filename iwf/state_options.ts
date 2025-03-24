import {
  PersistenceLoadingPolicy,
  PersistenceLoadingType,
  RetryPolicy,
  WaitUntilApiFailurePolicy,
} from "iwfidl";

import { IWorkflowState } from "./workflow_state.ts";
import { CommandResults } from "./command_result.ts";
import { Communication } from "./communication.ts";
import { Persistence } from "./persistence.ts";
import { StateDecision } from "./state_decision.ts";
import { WorkflowContext } from "./workflow_context.ts";

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

const DEFAULT_PERSISTENCE_LOADING_POLICY: PersistenceLoadingPolicy = {
  persistenceLoadingType: PersistenceLoadingType.LoadAllWithoutLocking,
  partialLoadingKeys: [],
  lockingKeys: [],
};

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  initialIntervalSeconds: 1,
  backoffCoefficient: 2,
  maximumIntervalSeconds: 100,
  maximumAttempts: 0,
  maximumAttemptsDurationSeconds: 0,
};

export const DEFAULT_STATE_OPTIONS: StateOptions = {
  dataAttributesLoadingPolicy: DEFAULT_PERSISTENCE_LOADING_POLICY,
  searchAttributesLoadingPolicy: DEFAULT_PERSISTENCE_LOADING_POLICY,
  waitUntilApiTimeoutSeconds: 0,
  waitUntilApiRetryPolicy: DEFAULT_RETRY_POLICY,
  waitUntilApiFailurePolicy: "FAIL_WORKFLOW_ON_FAILURE",
  waitUntilApiDataAttributesLoadingPolicy: DEFAULT_PERSISTENCE_LOADING_POLICY,
  waitUntilApiSearchAttributesLoadingPolicy: DEFAULT_PERSISTENCE_LOADING_POLICY,
  executeApiTimeoutSeconds: 0,
  executeApiRetryPolicy: DEFAULT_RETRY_POLICY,
  executeApiFailureProceedState: {
    getStateId: function (): string {
      return "DEFAULT_STATE_ID";
    },
    execute: function (
      ctx: WorkflowContext,
      input: unknown,
      commandResults: CommandResults,
      persistence: Persistence,
      communication: Communication,
    ): StateDecision {
      throw new Error("Function not implemented.");
    },
    getStateOptions: function (): StateOptions | undefined {
      return undefined;
    },
  },
  executeApiDataAttributesLoadingPolicy: DEFAULT_PERSISTENCE_LOADING_POLICY,
  executeApiSearchAttributesLoadingPolicy: DEFAULT_PERSISTENCE_LOADING_POLICY,
};
