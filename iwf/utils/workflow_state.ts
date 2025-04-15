import { IWorkflowState } from "../workflow_state.ts";

export function shouldSkipWaitUntilApi(state: IWorkflowState): boolean {
  return !state.waitUntil;
}
