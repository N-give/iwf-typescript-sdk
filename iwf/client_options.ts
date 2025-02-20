import { ObjectEncoder } from "./object_encoder.ts";

export type ClientOptions = {
  serverUrl: string;
  workerUrl: string;
  objectEncoder: ObjectEncoder;
};
