"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSkipWaitUntilApi = shouldSkipWaitUntilApi;
function shouldSkipWaitUntilApi(state) {
    if (state.waitUntil) {
        return true;
    }
    return false;
}
