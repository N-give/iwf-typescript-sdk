import {
  FORCE_COMPLETING_WORKFLOW_STATE_ID,
  FORCE_FAILING_WORKFLOW_STATE_ID,
  GRACEFUL_COMPLETING_WORKFLOW_STATE_ID,
  StateMovement,
} from "./state_movement.ts";
import { getFinalWorkflowStateId, IWorkflowState } from "./workflow_state.ts";

export type StateDecision = {
  nextStates: StateMovement[];
};

export function singleNextState(
  state: IWorkflowState,
  input?: unknown,
): StateDecision {
  return {
    nextStates: [{
      nextStateId: getFinalWorkflowStateId(state),
      nextStateInput: input,
    }],
  };
}

export function multiNextStates(
  ...states: IWorkflowState[]
): StateDecision {
  return {
    nextStates: Array.from(states.map((state) => {
      return {
        nextStateId: getFinalWorkflowStateId(state),
      };
    })),
  };
}

export function multiNextStatesWithInput(
  ...movements: StateMovement[]
): StateDecision {
  return {
    nextStates: movements,
  };
}

export function multiNextStatesByStateIds(
  ...ids: string[]
): StateDecision {
  return {
    nextStates: Array.from(ids.map((id) => {
      return {
        nextStateId: id,
      };
    })),
  };
}

export function forceFailWorkflow(output?: unknown): StateDecision {
  return {
    nextStates: [{
      nextStateId: FORCE_FAILING_WORKFLOW_STATE_ID,
      nextStateInput: output,
    }],
  };
}

export function gracefulCompleteWorkflow(output?: unknown): StateDecision {
  return {
    nextStates: [{
      nextStateId: GRACEFUL_COMPLETING_WORKFLOW_STATE_ID,
      nextStateInput: output,
    }],
  };
}

export function forceCompleteWorkflow(output?: unknown): StateDecision {
  return {
    nextStates: [{
      nextStateId: FORCE_COMPLETING_WORKFLOW_STATE_ID,
      nextStateInput: output,
    }],
  };
}
