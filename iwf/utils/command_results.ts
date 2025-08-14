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
      const result: SignalCommandResult = {
        commandId: r.commandId,
        channelName: r.signalChannelName,
        status: r.signalRequestStatus,
      };
      if (r.signalValue) {
        result.signalValue = encoder.decode(r.signalValue);
      }
      return result;
    });
  const internalChannels: InternalChannelCommandResult[] =
    (commandResults.interStateChannelResults || []).map(
      (r: InterStateChannelResult) => {
        const result: InternalChannelCommandResult = {
          commandId: r.commandId,
          channelName: r.channelName,
          status: r.requestStatus,
        };
        if (r.value) {
          result.signalValue = encoder.decode(r.value);
        }
        return result;
      },
    );
  return new CommandResults(
    timers,
    signals,
    internalChannels,
    commandResults.stateStartApiSucceeded,
  );
}
