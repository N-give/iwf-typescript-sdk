import { IWorkflowState } from "./workflow_state.ts";

export type StateDef = {
  state: IWorkflowState;
  canStartWorkflow: boolean;
};

export function startingStateDef(state: IWorkflowState): StateDef {
  return {
    state,
    canStartWorkflow: true,
  };
}

export function nonStartingStateDef(state: IWorkflowState): StateDef {
  return {
    state,
    canStartWorkflow: false,
  };
}
