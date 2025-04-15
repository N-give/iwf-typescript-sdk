import {
  StateDecision as IdlStateDecision,
  StateMovement as IdlStateMovement,
  WorkflowStateOptions,
} from "iwfidl";
import { IObjectEncoder } from "./object_encoder.ts";
import { Registry } from "./registry.ts";
import { StateDecision } from "./state_decision.ts";
import { toIdlStateOptions } from "./utils/state_options.ts";
import { shouldSkipWaitUntilApi } from "./utils/workflow_state.ts";

export type StateMovement = {
  nextStateId: string;
  nextStateInput?: unknown;
};

export const RESERVED_STATE_ID_PREFIX = "_SYS_";
export const GRACEFUL_COMPLETING_WORKFLOW_STATE_ID =
  "_SYS_GRACEFUL_COMPLETING_WORKFLOW";
export const FORCE_COMPLETING_WORKFLOW_STATE_ID =
  "_SYS_FORCE_COMPLETING_WORKFLOW";
export const FORCE_FAILING_WORKFLOW_STATE_ID = "_SYS_FORCE_FAILING_WORKFLOW";
export const DEAD_END_STATE_ID = "_SYS_DEAD_END";

export function toIdlDecision(
  from: StateDecision,
  wfType: string,
  registry: Registry,
  encoder: IObjectEncoder,
): IdlStateDecision {
  return {
    nextStates: Array.from(from.nextStates.map((m) => {
      const input = encoder.encode(m.nextStateInput);
      if (m.nextStateId.startsWith(RESERVED_STATE_ID_PREFIX)) {
        return {
          stateId: m.nextStateId,
          stateInput: input,
        };
      }
      const stateDef = registry.getWorkflowStateDef(wfType, m.nextStateId);
      if (!stateDef) {
        throw new Error(`state ${m.nextStateId} is not registered`);
      }
      const options: WorkflowStateOptions = toIdlStateOptions(
        shouldSkipWaitUntilApi(stateDef.state),
        stateDef.state.getStateOptions(),
      );
      return {
        stateId: m.nextStateId,
        stateInput: input,
        stateOptions: options,
      };
    })),
  };
}
