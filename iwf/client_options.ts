import { DEFAULT_ENCODER } from "./default_encoder.ts";
import { IObjectEncoder } from "./object_encoder.ts";

export type ClientOptions = {
  serverUrl: string;
  workerUrl: string;
  objectEncoder: IObjectEncoder;
  longPollApiMaxWaitTimeSeconds?: number;
};

export const DEFAULT_WORKER_PORT = 8803;
export const DEFAULT_SERVER_PORT = 8801;
export const DEFAULT_LONG_POLL_API_MAX_WAIT_TIMEOUT_SECONDS = 60;

export const LOCAL_DEFAULT_CLIENT_OPTIONS: ClientOptions = {
  workerUrl: `http://127.0.0.1:${DEFAULT_WORKER_PORT}`,
  serverUrl: `http://127.0.0.1:${DEFAULT_SERVER_PORT}`,
  objectEncoder: DEFAULT_ENCODER,
  longPollApiMaxWaitTimeSeconds: DEFAULT_LONG_POLL_API_MAX_WAIT_TIMEOUT_SECONDS,
};
