import { WorkflowState } from "./workflow_state.ts";

export type StateDef = {
  state: WorkflowState;
  canStartWorkflow: boolean;
};
