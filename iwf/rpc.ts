import { Context } from "iwfidl";
import { Communication } from "./communication.ts";
import { Persistence } from "./persistence.ts";

export type RPC = (
  ctx: Context,
  input: unknown,
  persistence: Persistence,
  communication: Communication,
) => unknown;
