import { ChannelRequestStatus } from "../gen/iwfidl/src";
import { TimerStatus } from "../gen/iwfidl/src/models/TimerStatus.ts";

export type TimerCommandResult = {
  commandId: string;
  status: TimerStatus;
};

export type SignalCommandResult = {
  commandId: string;
  channelName: string;
  signalValue: unknown;
  status: ChannelRequestStatus;
};

export type InternalChannelCommandResult = {
  commandId: string;
  channelName: string;
  signalValue: unknown;
  status: ChannelRequestStatus;
};

export class CommandResults {
  timers: TimerCommandResult[];
  signals: SignalCommandResult[];
  internalChannelCommandResults: InternalChannelCommandResult[];
  stateWaitUntilApiSucceeded: boolean;
}
