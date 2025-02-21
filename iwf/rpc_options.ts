import { PersistenceLoadingPolicy } from "../gen/iwfidl/src/models/PersistenceLoadingPolicy.ts";

export type RpcOptions = {
  timeoutSeconds: number;
  dataAttributesLoadingPolicy: PersistenceLoadingPolicy;
  searchAttributesLoadingPolicy: PersistenceLoadingPolicy;
};
