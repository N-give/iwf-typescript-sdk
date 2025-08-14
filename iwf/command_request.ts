import {
  CommandCombination,
  CommandRequest as IdlCommandRequest,
  CommandWaitingType,
  InterStateChannelCommand as IdlInterStateChannelCommand,
  SignalCommand as IdlSignalCommand,
  TimerCommand as IdlTimerCommand,
} from "iwfidl";
import {
  Command,
  CommandType,
  InternalChannelCommand,
  SignalCommand,
  TimerCommand,
} from "./command.ts";

export type CommandRequest = {
  commands?: Command[];
  commandCombinations?: CommandCombination[];
  commandWaitingType: CommandWaitingType;
};

export function emptyCommandRequest(): CommandRequest {
  return {
    commandWaitingType: "ALL_COMPLETED",
  };
}

export function anyCommandCompleteRequest(
  ...commands: Command[]
): CommandRequest {
  return {
    commands,
    commandWaitingType: "ANY_COMPLETED",
  };
}

export function allCommandsCompletedRequest(
  ...commands: Command[]
): CommandRequest {
  return {
    commands,
    commandWaitingType: "ALL_COMPLETED",
  };
}

export function anyCommandCombinationCompletedRequest(
  listOfCommandIds: string[][],
  ...commands: Command[]
): CommandRequest {
  if (
    commands.some((c) =>
      c.commandId === null || c.commandId === undefined || c.commandId === ""
    )
  ) {
    throw new Error(
      `commandId must be provided when using ANY_COMMAND_COMBINATION_COMPLETED`,
    );
  }

  return {
    commands,
    commandWaitingType: "ANY_COMBINATION_COMPLETED",
    commandCombinations: listOfCommandIds.map(
      (commandIds) => {
        return {
          commandIds,
        };
      },
    ),
  };
}

export function toIdlCommandRequest(
  commandRequest: CommandRequest,
): IdlCommandRequest {
  const initialValue: {
    timers: IdlTimerCommand[];
    signals: IdlSignalCommand[];
    interStateCmds: IdlInterStateChannelCommand[];
  } = {
    timers: [],
    signals: [],
    interStateCmds: [],
  };
  const { timers, signals, interStateCmds }: {
    timers: IdlTimerCommand[];
    signals: IdlSignalCommand[];
    interStateCmds: IdlInterStateChannelCommand[];
  } = (commandRequest.commands || []).reduce(
    (cs, c) => {
      switch (c.commandType) {
        case CommandType.TIMER:
          cs.timers.push({
            commandId: c.commandId,
            durationSeconds: c.timerCommand.durationSeconds,
          });
          break;

        case CommandType.SIGNAL_CHANNEL:
          cs.signals.push({
            commandId: c.commandId,
            signalChannelName: c.signalCommand.channelName,
          });
          break;

        case CommandType.INTERNAL_CHANNEL:
          cs.interStateCmds.push({
            commandId: c.commandId,
            channelName: c.internalChannelCommand.channelName,
          });
          break;

        default:
          break;
      }
      return cs;
    },
    initialValue,
  );

  const idlCmdReq: IdlCommandRequest = {
    commandWaitingType: commandRequest.commandWaitingType,
  };
  if (timers.length > 0) {
    idlCmdReq.timerCommands = timers;
  }
  if (signals.length > 0) {
    idlCmdReq.signalCommands = signals;
  }
  if (interStateCmds.length > 0) {
    idlCmdReq.interStateChannelCommands = interStateCmds;
  }
  if (
    commandRequest.commandCombinations &&
    commandRequest.commandCombinations.length > 0
  ) {
    idlCmdReq.commandCombinations = commandRequest.commandCombinations;
  }
  return idlCmdReq;
}
