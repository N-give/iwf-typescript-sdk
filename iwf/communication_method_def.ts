import { DataSources } from "./data_sources.ts";
import { RPC } from "./rpc.ts";
import { RpcOptions } from "./rpc_options.ts";

export type CommunicationMethodDef<T extends DataSources> =
  & {
    name: string;
    communicationMethod: T;
  }
  & ({
    communicationMethod:
      | DataSources.SIGNAL_CHANNEL
      | DataSources.INTERNAL_CHANNEL;
    isPrefix: boolean;
    validator: <V>(v: unknown) => V;
  } | {
    communicationMethod: DataSources.RPC_METHOD;
    rpc: RPC;
    rpcOptions: RpcOptions;
  });

export function newSignalChannel(
  name: string,
  validator: <V>(v: unknown) => V,
): CommunicationMethodDef<DataSources.SIGNAL_CHANNEL> {
  return {
    name,
    communicationMethod: DataSources.SIGNAL_CHANNEL,
    isPrefix: false,
    validator,
  };
}

export function newSignalChannelPrefix(
  name: string,
  validator: <V>(v: unknown) => V,
): CommunicationMethodDef<DataSources.SIGNAL_CHANNEL> {
  return {
    name,
    communicationMethod: DataSources.SIGNAL_CHANNEL,
    isPrefix: true,
    validator,
  };
}

export function newInternalChannel(
  name: string,
  validator: <V>(v: unknown) => V,
): CommunicationMethodDef<DataSources.INTERNAL_CHANNEL> {
  return {
    name,
    communicationMethod: DataSources.INTERNAL_CHANNEL,
    isPrefix: false,
    validator,
  };
}

export function newInternalChannelPrefix(
  name: string,
  validator: <V>(v: unknown) => V,
): CommunicationMethodDef<DataSources.INTERNAL_CHANNEL> {
  return {
    name,
    communicationMethod: DataSources.INTERNAL_CHANNEL,
    isPrefix: true,
    validator,
  };
}

export function newRpcMethod(
  name: string,
  rpc: RPC,
  rpcOptions: RpcOptions,
): CommunicationMethodDef<DataSources.RPC_METHOD> {
  return {
    name,
    communicationMethod: DataSources.RPC_METHOD,
    rpc,
    rpcOptions,
  };
}
