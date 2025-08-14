import z from "zod/v3";
import {
  anyCommandCombinationCompletedRequest,
  anyCommandCompleteRequest,
  CommandRequest,
} from "../../iwf/command_request.ts";
import {
  CommandResults,
  SignalCommandResult,
} from "../../iwf/command_result.ts";
import { Communication } from "../../iwf/communication.ts";
import {
  CommunicationMethodDef,
  newSignalChannel,
  newSignalChannelPrefix,
} from "../../iwf/communication_method_def.ts";
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
import { StateOptions } from "../../iwf/state_options.ts";
import { IWorkflow } from "../../iwf/workflow.ts";
import { WorkflowContext } from "../../iwf/workflow_context.ts";
import { IWorkflowState } from "../../iwf/workflow_state.ts";
import {
  newSignalCommand,
  newTimerCommandByDuration,
} from "../../iwf/command.ts";

const SignalChannel1Type = z.number();
const SignalChannel2Type = z.number();
const SignalChannel3Type = z.void();
const SignalChannelPrefixType = z.number();

export const SIGNAL_CHANNEL_NAME_1 = "test-signal-channel-1";
export const SIGNAL_CHANNEL_NAME_2 = "test-signal-channel-2";
export const SIGNAL_CHANNEL_NAME_3 = "test-signal-channel-3";
export const SIGNAL_CHANNEL_PREFIX = "test-signal-channel-prefix";

class BasicSignalWorkflowState1 implements IWorkflowState {
  #COMMAND_ID = "test-signal-command";

  getStateId(): string {
    return "BasicSignalWorkflowState1";
  }

  getStateOptions(): StateOptions | undefined {
    return undefined;
  }

  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    console.log("BasicSignalWorkflowState1::waitUntil");
    return anyCommandCompleteRequest(
      newSignalCommand(this.#COMMAND_ID, SIGNAL_CHANNEL_NAME_1),
      newSignalCommand(this.#COMMAND_ID, SIGNAL_CHANNEL_NAME_2),
    );
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log("BasicSignalWorkflowState1::execute");
    let output = 0;
    const signalCommandResult1: SignalCommandResult = commandResults
      .getAllSignalCommandResults()[0];
    if (signalCommandResult1.status === "RECEIVED") {
      output += signalCommandResult1.signalValue as number;
    }

    const signalCommandResult2: SignalCommandResult = commandResults
      .getAllSignalCommandResults()[1];
    if (signalCommandResult2.status === "RECEIVED") {
      output += signalCommandResult2.signalValue as number;
    }
    return singleNextState(BASIC_SIGNAL_WORKFLOW_STATE_2, output);
  }
}

class BasicSignalWorkflowState2 implements IWorkflowState {
  #SIGNAL_COMMAND_ID_1 = "test-signal-1";
  #SIGNAL_COMMAND_ID_2 = "test-signal-2";
  #SIGNAL_COMMAND_ID_3 = "test-signal-3";
  #TIMER_COMMAND_ID = "test-timer-id";

  DURATION_SECONDS = 10; // 365 day long timer duration
  // DURATION_SECONDS = 60 * 60 * 24 * 365; // 365 day long timer duration

  getStateId(): string {
    return "BasicSignalWorkflowState2";
  }

  getStateOptions(): StateOptions | undefined {
    return undefined;
  }

  waitUntil(
    ctx: WorkflowContext,
    input: unknown,
    persistence: Persistence,
    communication: Communication,
  ): CommandRequest {
    console.log("BasicSignalWorkflowState2::waitUntil");
    return anyCommandCombinationCompletedRequest(
      [[
        this.#SIGNAL_COMMAND_ID_1,
        this.#SIGNAL_COMMAND_ID_3,
        this.#TIMER_COMMAND_ID,
      ]],
      newSignalCommand(this.#SIGNAL_COMMAND_ID_1, SIGNAL_CHANNEL_NAME_1),
      newSignalCommand(this.#SIGNAL_COMMAND_ID_1, SIGNAL_CHANNEL_NAME_2),
      newSignalCommand(this.#SIGNAL_COMMAND_ID_2, SIGNAL_CHANNEL_NAME_3),
      newSignalCommand(this.#SIGNAL_COMMAND_ID_3, `${SIGNAL_CHANNEL_PREFIX}-1`),
      newTimerCommandByDuration(this.#TIMER_COMMAND_ID, this.DURATION_SECONDS),
    );
  }

  execute(
    ctx: WorkflowContext,
    input: unknown,
    commandResults: CommandResults,
    persistence: Persistence,
    communication: Communication,
  ): StateDecision {
    console.log("BasicSignalWorkflowState2::execute");
    let output = input as number;
    const signalCommandResult1 = commandResults.getAllSignalCommandResults()[0];
    if (signalCommandResult1.status === "RECEIVED") {
      output += signalCommandResult1.signalValue as number;
    }

    const signalCommandResult2 = commandResults.getAllSignalCommandResults()[1];
    if (signalCommandResult2.status === "RECEIVED") {
      output += signalCommandResult2.signalValue as number;
    }

    const signalCommandResult3 = commandResults.getAllSignalCommandResults()[2];
    if (
      signalCommandResult3.status === "RECEIVED" ||
      signalCommandResult3.commandId !== this.#SIGNAL_COMMAND_ID_2
    ) {
      output += signalCommandResult3.signalValue as number;
    }

    const signalCommandResult4 = commandResults.getAllSignalCommandResults()[3];
    if (
      signalCommandResult4.status === "RECEIVED" ||
      signalCommandResult4.commandId !== this.#SIGNAL_COMMAND_ID_3
    ) {
      output += signalCommandResult4.signalValue as number;
    }

    const timerResult = commandResults.getAllTimerCommandResults()[0];
    if (timerResult.status === "FIRED") {
      output += 100;
    }
    return gracefulCompleteWorkflow(output);
  }
}

export const BASIC_SIGNAL_WORKFLOW_STATE_1 = new BasicSignalWorkflowState1();
export const BASIC_SIGNAL_WORKFLOW_STATE_2 = new BasicSignalWorkflowState2();

class BasicSignalWorkflow implements IWorkflow {
  getWorkflowType(): string {
    return "BasicSignalWorkflow";
  }

  getWorkflowStates(): StateDef[] {
    return [
      startingStateDef(BASIC_SIGNAL_WORKFLOW_STATE_1),
      nonStartingStateDef(BASIC_SIGNAL_WORKFLOW_STATE_2),
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
      newSignalChannel(
        SIGNAL_CHANNEL_NAME_1,
        <V>(v: unknown) => SignalChannel1Type.parse(v) as V,
      ),
      newSignalChannel(
        SIGNAL_CHANNEL_NAME_2,
        <V>(v: unknown) => SignalChannel2Type.parse(v) as V,
      ),
      newSignalChannel(
        SIGNAL_CHANNEL_NAME_3,
        <V>(v: unknown) => SignalChannel3Type.parse(v) as V,
      ),
      newSignalChannelPrefix(
        SIGNAL_CHANNEL_PREFIX,
        <V>(v: unknown) => SignalChannelPrefixType.parse(v) as V,
      ),
    ];
  }
}

export const BASIC_SIGNAL_WORKFLOW = new BasicSignalWorkflow();
