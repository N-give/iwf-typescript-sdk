import { RpcOptions } from "./rpc_options.ts";

export enum CommunicationMethodType {
  SIGNAL_CHANNEL,
  INTERNAL_CHANNEL,
  RPC_METHOD,
}

export type CommunicationMethodDef =
  & {
    name: string;
  }
  & ({
    communicationMethod:
    | CommunicationMethodType.SIGNAL_CHANNEL
    | CommunicationMethodType.INTERNAL_CHANNEL;
  } | {
    communicationMethod: CommunicationMethodType.RPC_METHOD;
    rpc: RPC;
    rpcOptions: RpcOptions;
  });

export function newSignalChannel(name: string): CommunicationMethodDef {
  return {
    name,
    communicationMethod: CommunicationMethodType.SIGNAL_CHANNEL,
  };
}

export function newInternalChannel(name: string): CommunicationMethodDef {
  return {
    name,
    communicationMethod: CommunicationMethodType.INTERNAL_CHANNEL,
  };
}

export function newRpcMethod(
  name: string,
  rpc: RPC,
  rpcOptions: RpcOptions,
): CommunicationMethodDef {
  return {
    name,
    communicationMethod: CommunicationMethodType.RPC_METHOD,
    rpc,
    rpcOptions,
  };
}
