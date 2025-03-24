import { ChannelRequestStatus, TimerStatus } from "iwfidl";

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
  internalChannels: InternalChannelCommandResult[];
  private _stateWaitUntilApiSucceeded: boolean;

  constructor(stateWaitUntilApiSucceeded: boolean) {
    this.timers = [];
    this.signals = [];
    this.internalChannels = [];
    this._stateWaitUntilApiSucceeded = stateWaitUntilApiSucceeded;
  }

  getTimerCommandResultById(
    commandId: string,
  ): TimerCommandResult | undefined {
    return this.timers.find((t) => t.commandId === commandId);
  }

  getSignalCommandResultById(
    commandId: string,
  ): SignalCommandResult | undefined {
    return this.signals.find((t) => t.commandId === commandId);
  }

  getInternalChannelCommandResultById(
    commandId: string,
  ): InternalChannelCommandResult | undefined {
    return this.internalChannels.find((t) => t.commandId === commandId);
  }

  get stateWaitUntilApiSucceeded(): boolean {
    return this._stateWaitUntilApiSucceeded;
  }
}
