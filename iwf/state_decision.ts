import { StateMovement } from "./state_movement.ts";

export type StateDecision = {
  nextStates: StateMovement[];
};
