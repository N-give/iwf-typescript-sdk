import {
  CommandResults as IdlCommandResults,
  InterStateChannelResult,
  SignalResult,
  TimerResult,
} from "iwfidl";
import { IObjectEncoder } from "../object_encoder.ts";
import {
  CommandResults,
  InternalChannelCommandResult,
  SignalCommandResult,
  TimerCommandResult,
} from "../command_result.ts";

export function fromIdlCommandResults(
  commandResults: IdlCommandResults = {
    signalResults: [],
    interStateChannelResults: [],
    timerResults: [],
    stateStartApiSucceeded: false,
  },
  encoder: IObjectEncoder,
): CommandResults {
  const timers: TimerCommandResult[] = (commandResults.timerResults || []).map(
    (r: TimerResult) => {
      return {
        commandId: r.commandId,
        status: r.timerStatus,
      };
    },
  );
  const signals: SignalCommandResult[] = (commandResults.signalResults || [])
    .map((r: SignalResult) => {
      return {
        commandId: r.commandId,
        channelName: r.signalChannelName,
        status: r.signalRequestStatus,
        signalValue: r.signalValue,
      };
    });
  const internalChannels: InternalChannelCommandResult[] =
    (commandResults.interStateChannelResults || []).map(
      (r: InterStateChannelResult) => {
        return {
          commandId: r.commandId,
          channelName: r.channelName,
          status: r.requestStatus,
          signalValue: r.value,
        };
      },
    );
  return new CommandResults(
    timers,
    signals,
    internalChannels,
    commandResults.stateStartApiSucceeded,
  );
}
