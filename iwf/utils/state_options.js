"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIdlStateOptions = toIdlStateOptions;
var iwfidl_1 = require("iwfidl");
var state_options_ts_1 = require("../state_options.ts");
var workflow_state_ts_1 = require("../workflow_state.ts");
var workflow_state_ts_2 = require("./workflow_state.ts");
function toIdlStateOptions(skipWaitUntil, stateOptions) {
    var idlStateOptions = {
        dataAttributesLoadingPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.dataAttributesLoadingPolicy,
        searchAttributesLoadingPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.searchAttributesLoadingPolicy,
        waitUntilApiTimeoutSeconds: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.waitUntilApiTimeoutSeconds,
        waitUntilApiRetryPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.waitUntilApiRetryPolicy,
        waitUntilApiFailurePolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.waitUntilApiFailurePolicy,
        waitUntilApiDataAttributesLoadingPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.waitUntilApiDataAttributesLoadingPolicy,
        waitUntilApiSearchAttributesLoadingPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.waitUntilApiSearchAttributesLoadingPolicy,
        executeApiTimeoutSeconds: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.executeApiTimeoutSeconds,
        executeApiRetryPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.executeApiRetryPolicy,
        executeApiDataAttributesLoadingPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.executeApiDataAttributesLoadingPolicy,
        executeApiSearchAttributesLoadingPolicy: stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.executeApiSearchAttributesLoadingPolicy,
    };
    if (skipWaitUntil) {
        idlStateOptions.skipWaitUntil = true;
    }
    if (stateOptions === null || stateOptions === void 0 ? void 0 : stateOptions.executeApiFailureProceedState) {
        idlStateOptions.executeApiFailurePolicy =
            iwfidl_1.ExecuteApiFailurePolicy.ProceedToConfiguredState;
        idlStateOptions.executeApiFailureProceedStateId = (0, workflow_state_ts_1.getFinalWorkflowStateId)(stateOptions.executeApiFailureProceedState);
        var proceedStateOptions = stateOptions
            .executeApiFailureProceedState
            .getStateOptions
            ? stateOptions.executeApiFailureProceedState.getStateOptions()
            : state_options_ts_1.DEFAULT_STATE_OPTIONS;
        if ((proceedStateOptions === null || proceedStateOptions === void 0 ? void 0 : proceedStateOptions.executeApiFailureProceedState) !== null &&
            (proceedStateOptions === null || proceedStateOptions === void 0 ? void 0 : proceedStateOptions.executeApiFailureProceedState) !== undefined) {
            throw new Error("nested failure handling/recovery is not supported: ExecuteApiFailureProceedState cannot have ExecuteApiFailureProceedState");
        }
        idlStateOptions.executeApiFailureProceedStateOptions = toIdlStateOptions((0, workflow_state_ts_2.shouldSkipWaitUntilApi)(stateOptions.executeApiFailureProceedState), proceedStateOptions);
    }
    return idlStateOptions;
}
