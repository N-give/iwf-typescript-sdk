import { CommandCombination, CommandWaitingType } from "../gen/iwfidl/src";
import { Command } from "./command.ts";

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
      c.commandId === null || c.commandId || undefined || c.commandId === ""
    )
  ) {
    throw new Error(
      `commandId must be provided when using ANY_COMMAND_COMBINATION_COMPLETED`,
    );
  }

  return {
    commands,
    commandWaitingType: "ANY_COMBINATION_COMPLETED",
    commandCombinations: Array.from(listOfCommandIds.map(
      (commandIds) => {
        return {
          commandIds,
        };
      },
    )),
  };
}
