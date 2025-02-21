import { IWorkflowState } from "./workflow_state.ts";

export type StateDef = {
  state: IWorkflowState;
  canStartWorkflow: boolean;
};
