import { CommandResults } from "../../iwf/command_result.ts";
import { Communication } from "../../iwf/communication.ts";
import { CommunicationMethodDef } from "../../iwf/communication_method_def.ts";
import { Persistence } from "../../iwf/persistence.ts";
import { PersistenceFieldDef } from "../../iwf/persistence_def.ts";
import { StateDecision } from "../../iwf/state_decision.ts";
import { StateDef } from "../../iwf/state_def.ts";
import { IWorkflow } from "../../iwf/workflow.ts";
import { WorkflowContext } from "../../iwf/workflow_context.ts";
import { IWorkflowState } from "../../iwf/workflow_state.ts";

class BasicState implements IWorkflowState {
  getStateId(): string {
    return "TestState";
  }
  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log("test state running");
    return {
      nextStates: [],
    };
  }

  getStateOptions() {
    return undefined;
  }
}

export const BASIC_STATE = new BasicState();

class BasicWorkflow implements IWorkflow {
  getWorkflowStates(): StateDef[] {
    return [
      {
        state: BASIC_STATE,
        canStartWorkflow: true,
      },
    ];
  }
  getPersistenceSchema(): PersistenceFieldDef[] {
    return [];
  }
  getCommunicationSchema(): CommunicationMethodDef[] {
    return [];
  }
  getWorkflowType(): string {
    return "TestWorkflow";
  }
}

export const BASIC_WORKFLOW = new BasicWorkflow();
