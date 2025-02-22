export enum CommandType {
  SIGNAL_CHANNEL,
  TIMER,
  INTERNAL_CHANNEL,
}

export type TimerCommand = {
  durationSeconds: number;
};

export type SignalCommand = {
  channelName: string;
};

export type InternalChannelCommand = {
  channelName: string;
};

export type Command =
  & {
    commandId: string;
  }
  & ({
    commandType: CommandType.TIMER;
    timerCommand: TimerCommand;
  } | {
    commandType: CommandType.SIGNAL_CHANNEL;
    signalCommand: SignalCommand;
  } | {
    commandType: CommandType.INTERNAL_CHANNEL;
    internalChannelCommand: InternalChannelCommand;
  });

export function newSignalCommand(
  commandId: string,
  channelName: string,
): Command {
  return {
    commandId,
    commandType: CommandType.SIGNAL_CHANNEL,
    signalCommand: {
      channelName,
    },
  };
}

export function newInternalCommand(
  commandId: string,
  channelName: string,
): Command {
  return {
    commandId,
    commandType: CommandType.INTERNAL_CHANNEL,
    internalChannelCommand: {
      channelName,
    },
  };
}

export function newTimerCommand(
  commandId: string,
  firingTime: Date,
): Command {
  const now = new Date().getTime();
  const durationSeconds = (firingTime.getTime() - now) / 1000;

  if (durationSeconds < 0) {
    throw new Error(`firingTime set in the past`);
  }

  return {
    commandId,
    commandType: CommandType.TIMER,
    timerCommand: {
      durationSeconds,
    },
  };
}

export function newTimerCommandByDuration(
  commandId: string,
  durationSeconds: number,
): Command {
  if (durationSeconds < 0) {
    throw new Error(`durationSeconds must be greater than 0`);
  }

  return {
    commandId,
    commandType: CommandType.TIMER,
    timerCommand: {
      durationSeconds,
    },
  };
}

export type CommandRequest = {
  //
};
