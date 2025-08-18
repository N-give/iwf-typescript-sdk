import z from "zod/v3";
import {
  anyCommandCombinationCompletedRequest,
  CommandRequest,
  emptyCommandRequest,
} from "../../iwf/command_request.ts";
import { CommandResults } from "../../iwf/command_result.ts";
import { Communication } from "../../iwf/communication.ts";
import {
  CommunicationMethodDef,
  newInternalChannel,
  newInternalChannelPrefix,
} from "../../iwf/communication_method_def.ts";
import { DataSources } from "../../iwf/data_sources.ts";
import { Persistence } from "../../iwf/persistence.ts";
import { PersistenceFieldDef } from "../../iwf/persistence_def.ts";
import {
  gracefulCompleteWorkflow,
  multiNextStatesWithInput,
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
import { newStateMovement } from "../../iwf/state_movement.ts";
import { newInternalCommand } from "../../iwf/command.ts";

export const INTER_STATE_CHANNEL_1 = "inter-state-channel-1";
export const INTER_STATE_CHANNEL_2 = "inter-state-channel-2";
export const INTER_STATE_CHANNEL_PREFIX = "inter-state-channel-prefix";
export const INTER_STATE_CHANNEL_PREFIX_1 = `${INTER_STATE_CHANNEL_PREFIX}-1`;

export const COMMAND_ID_1 = "command-id-1";
export const COMMAND_ID_2 = "command-id-2";

class BasicInternalChannelWorkflowState0 implements IWorkflowState {
  getStateId(): string {
    return "BasicInternalChannelWorkflowState0";
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    return multiNextStatesWithInput(
      newStateMovement(BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_1, input),
      newStateMovement(BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_2, input),
    );
  }
}

class BasicInternalChannelWorkflowState1 implements IWorkflowState {
  getStateId(): string {
    return "BasicInternalChannelWorkflowState1";
  }
  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    return anyCommandCombinationCompletedRequest(
      [[
        COMMAND_ID_1,
        COMMAND_ID_2,
      ]],
      newInternalCommand(COMMAND_ID_1, INTER_STATE_CHANNEL_1),
      newInternalCommand(COMMAND_ID_1, INTER_STATE_CHANNEL_2),
      newInternalCommand(COMMAND_ID_2, INTER_STATE_CHANNEL_PREFIX_1),
    );
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    let output = input as number;
    const result1 = commandResults.getAllInternalChannelCommandResults()[0];
    output += result1.signalValue as number;

    const result2 = commandResults.getAllInternalChannelCommandResults()[1];
    if (result2.status !== "WAITING") {
      throw new Error("second command should still be waiting");
    }

    const result3 = commandResults.getAllInternalChannelCommandResults()[2];
    if (result3.status !== "RECEIVED") {
      throw new Error("third command should be `RECIEVED`");
    }

    return gracefulCompleteWorkflow(output);
  }
}

class BasicInternalChannelWorkflowState2 implements IWorkflowState {
  getStateId(): string {
    return "BasicInternalChannelWorkflowState2";
  }
  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    communication.publishToInternalChannel(INTER_STATE_CHANNEL_1, 2);
    communication.publishToInternalChannel(
      INTER_STATE_CHANNEL_PREFIX_1,
      3,
    );
    return emptyCommandRequest();
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    return gracefulCompleteWorkflow();
  }
}

class BasicInternalChannelWorkflow implements IWorkflow {
  getWorkflowStates(): StateDef[] {
    return [
      startingStateDef(BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_0),
      nonStartingStateDef(BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_1),
      nonStartingStateDef(BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_2),
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
    return [
      newInternalChannel(
        INTER_STATE_CHANNEL_1,
        <V>(v: unknown) => z.number().parse(v) as V,
      ),
      newInternalChannel(
        INTER_STATE_CHANNEL_2,
        <V>(v: unknown) => z.number().parse(v) as V,
      ),
      newInternalChannelPrefix(
        INTER_STATE_CHANNEL_PREFIX_1,
        <V>(v: unknown) => z.number().parse(v) as V,
      ),
    ];
  }
  getWorkflowType(): string {
    return "BasicInternalChannelWorkflow";
  }
}

export const BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_0 =
  new BasicInternalChannelWorkflowState0();
export const BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_1 =
  new BasicInternalChannelWorkflowState1();
export const BASIC_INTERNAL_CHANNEL_WORKFLOW_STATE_2 =
  new BasicInternalChannelWorkflowState2();
export const BASIC_INTERNAL_CHANNEL_WORKFLOW =
  new BasicInternalChannelWorkflow();
