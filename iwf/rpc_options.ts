import { PersistenceLoadingPolicy } from "iwfidl";

export type RpcOptions = {
  timeoutSeconds: number;
  dataAttributesLoadingPolicy: PersistenceLoadingPolicy;
  searchAttributesLoadingPolicy: PersistenceLoadingPolicy;
};
