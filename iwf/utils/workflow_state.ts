import { IWorkflowState } from "../workflow_state.ts";

export function shouldSkipWaitUntilApi(state: IWorkflowState): boolean {
  if (state.waitUntil) {
    return true;
  }
  return false;
}
