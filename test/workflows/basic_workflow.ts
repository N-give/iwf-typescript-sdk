import {
  CommandRequest,
  emptyCommandRequest,
} from "../../iwf/command_request.ts";
import { CommandResults } from "../../iwf/command_result.ts";
import { Communication } from "../../iwf/communication.ts";
import { CommunicationMethodDef } from "../../iwf/communication_method_def.ts";
import { DataSources } from "../../iwf/data_sources.ts";
import { Persistence } from "../../iwf/persistence.ts";
import { PersistenceFieldDef } from "../../iwf/persistence_def.ts";
import {
  gracefulCompleteWorkflow,
  singleNextState,
  StateDecision,
} from "../../iwf/state_decision.ts";
import {
  nonStartingStateDef,
  startingStateDef,
  StateDef,
} from "../../iwf/state_def.ts";
import { IWorkflow } from "../../iwf/workflow.ts";
import { WorkflowContext } from "../../iwf/workflow_context.ts";
import { IWorkflowState } from "../../iwf/workflow_state.ts";

class BasicState2 implements IWorkflowState {
  getStateId(): string {
    return "TestState2";
  }

  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    console.log(`${ctx.stateExecutionId} wait until ${ctx.attempt}`);
    return emptyCommandRequest();
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log(`${ctx.stateExecutionId} execute ${ctx.attempt}`);
    return gracefulCompleteWorkflow();
  }
}

export const BASIC_STATE_2 = new BasicState2();

class BasicState1 implements IWorkflowState {
  getStateId(): string {
    return "TestState1";
  }

  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    console.log(`${ctx.stateExecutionId} wait until ${ctx.attempt}`);
    return emptyCommandRequest();
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log(`${ctx.stateExecutionId} execute ${ctx.attempt}`);
    return singleNextState(BASIC_STATE_2);
  }
}

export const BASIC_STATE_1 = new BasicState1();

class BasicWorkflow implements IWorkflow {
  getWorkflowStates(): StateDef[] {
    return [
      startingStateDef(BASIC_STATE_1),
      nonStartingStateDef(BASIC_STATE_2),
    ];
  }
  getPersistenceSchema(): PersistenceFieldDef<
    DataSources.DATA_ATTRIBUTE | DataSources.SEARCH_ATTRIBUTE
  >[] {
    return [];
  }
  getCommunicationSchema(): CommunicationMethodDef<
    | DataSources.SIGNAL_CHANNEL
    | DataSources.INTERNAL_CHANNEL
    | DataSources.RPC_METHOD
  >[] {
    return [];
  }
  getWorkflowType(): string {
    return "BasicWorkflow";
  }
}

export const BASIC_WORKFLOW = new BasicWorkflow();
