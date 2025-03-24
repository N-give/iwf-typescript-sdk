import { ExecuteApiFailurePolicy, WorkflowStateOptions } from "iwfidl";
import { DEFAULT_STATE_OPTIONS, StateOptions } from "../state_options.ts";
import { getFinalWorkflowStateId } from "../workflow_state.ts";
import { shouldSkipWaitUntilApi } from "./workflow_state.ts";

export function toIdlStateOptions(
  skipWaitUntil: boolean,
  stateOptions?: StateOptions,
) {
  const idlStateOptions: WorkflowStateOptions = {
    dataAttributesLoadingPolicy: stateOptions?.dataAttributesLoadingPolicy,
    searchAttributesLoadingPolicy: stateOptions?.searchAttributesLoadingPolicy,
    waitUntilApiTimeoutSeconds: stateOptions?.waitUntilApiTimeoutSeconds,
    waitUntilApiRetryPolicy: stateOptions?.waitUntilApiRetryPolicy,
    waitUntilApiFailurePolicy: stateOptions?.waitUntilApiFailurePolicy,
    waitUntilApiDataAttributesLoadingPolicy: stateOptions
      ?.waitUntilApiDataAttributesLoadingPolicy,
    waitUntilApiSearchAttributesLoadingPolicy: stateOptions
      ?.waitUntilApiSearchAttributesLoadingPolicy,
    executeApiTimeoutSeconds: stateOptions?.executeApiTimeoutSeconds,
    executeApiRetryPolicy: stateOptions?.executeApiRetryPolicy,
    executeApiDataAttributesLoadingPolicy: stateOptions
      ?.executeApiDataAttributesLoadingPolicy,
    executeApiSearchAttributesLoadingPolicy: stateOptions
      ?.executeApiSearchAttributesLoadingPolicy,
  };

  if (skipWaitUntil) {
    idlStateOptions.skipWaitUntil = true;
  }

  if (stateOptions?.executeApiFailureProceedState) {
    idlStateOptions.executeApiFailurePolicy =
      ExecuteApiFailurePolicy.ProceedToConfiguredState;
    idlStateOptions.executeApiFailureProceedStateId = getFinalWorkflowStateId(
      stateOptions.executeApiFailureProceedState,
    );

    const proceedStateOptions: StateOptions = stateOptions
        .executeApiFailureProceedState
        .getStateOptions
      ? stateOptions.executeApiFailureProceedState.getStateOptions()!
      : DEFAULT_STATE_OPTIONS;
    if (
      proceedStateOptions?.executeApiFailureProceedState !== null &&
      proceedStateOptions?.executeApiFailureProceedState !== undefined
    ) {
      throw new Error(
        "nested failure handling/recovery is not supported: ExecuteApiFailureProceedState cannot have ExecuteApiFailureProceedState",
      );
    }

    idlStateOptions.executeApiFailureProceedStateOptions = toIdlStateOptions(
      shouldSkipWaitUntilApi(stateOptions.executeApiFailureProceedState),
      proceedStateOptions,
    );
  }

  return idlStateOptions;
}
