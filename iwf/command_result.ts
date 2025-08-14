import { ChannelRequestStatus, TimerStatus } from "iwfidl";

export type TimerCommandResult = {
  commandId: string;
  status: TimerStatus;
};

export type SignalCommandResult = {
  commandId: string;
  channelName: string;
  signalValue?: unknown;
  status: ChannelRequestStatus;
};

export type InternalChannelCommandResult = {
  commandId: string;
  channelName: string;
  signalValue?: unknown;
  status: ChannelRequestStatus;
};

export class CommandResults {
  _timers: TimerCommandResult[];
  _signals: SignalCommandResult[];
  _internalChannels: InternalChannelCommandResult[];
  private _stateWaitUntilApiSucceeded: boolean;

  constructor(
    timers: TimerCommandResult[] = [],
    signals: SignalCommandResult[] = [],
    internalChannels: InternalChannelCommandResult[] = [],
    stateWaitUntilApiSucceeded: boolean = false,
  ) {
    this._timers = timers;
    this._signals = signals;
    this._internalChannels = internalChannels;
    this._stateWaitUntilApiSucceeded = stateWaitUntilApiSucceeded;
  }

  getAllSignalCommandResults(): SignalCommandResult[] {
    return this._signals;
  }

  getAllTimerCommandResults(): TimerCommandResult[] {
    return this._timers;
  }

  getTimerCommandResultById(
    commandId: string,
  ): TimerCommandResult | undefined {
    return this._timers.find((t) => t.commandId === commandId);
  }

  getSignalCommandResultById(
    commandId: string,
  ): SignalCommandResult | undefined {
    return this._signals.find((t) => t.commandId === commandId);
  }

  getInternalChannelCommandResultById(
    commandId: string,
  ): InternalChannelCommandResult | undefined {
    return this._internalChannels.find((t) => t.commandId === commandId);
  }

  get stateWaitUntilApiSucceeded(): boolean {
    return this._stateWaitUntilApiSucceeded;
  }
}
