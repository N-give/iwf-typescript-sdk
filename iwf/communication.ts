import { ChannelInfo, EncodedObject } from "iwfidl";
import { IObjectEncoder } from "./object_encoder.ts";
import { StateMovement } from "./state_movement.ts";
import { TypeStore } from "./type_store.ts";
import { DataSources } from "./data_sources.ts";

export class Communication {
  encoder: IObjectEncoder;
  internalChannelInfos: Map<string, ChannelInfo>;
  signalChannelInfos: Map<string, ChannelInfo>;
  internalChannelNames: TypeStore<DataSources.INTERNAL_CHANNEL>;
  signalChannelNames: TypeStore<DataSources.SIGNAL_CHANNEL>;
  private _toPublish: Map<string, EncodedObject[]>;
  stateMovements: StateMovement[];

  constructor(
    encoder: IObjectEncoder,
    internalChannelInfos: Map<string, ChannelInfo> = new Map(),
    signalChannelInfos: Map<string, ChannelInfo> = new Map(),
    internalChannelNames: TypeStore<DataSources.INTERNAL_CHANNEL> =
      new TypeStore(DataSources.INTERNAL_CHANNEL),
    signalChannelNames: TypeStore<DataSources.SIGNAL_CHANNEL> = new TypeStore(
      DataSources.SIGNAL_CHANNEL,
    ),
  ) {
    this.encoder = encoder;
    this.internalChannelInfos = internalChannelInfos;
    this.signalChannelInfos = signalChannelInfos;
    this.internalChannelNames = internalChannelNames;
    this.signalChannelNames = signalChannelNames;
    this._toPublish = new Map();
    this.stateMovements = [];
  }

  getInternalChannelSize(channelName: string): number {
    this.validateInternalChannelName(channelName, undefined);
    return (this.internalChannelInfos.get(channelName)?.size || 0) +
      (this._toPublish.get(channelName)?.length || 0);
  }

  getSignalChannelSize(channelName: string): number {
    this.validateSignalChannelName(channelName, undefined);
    return (this.signalChannelInfos.get(channelName)?.size || 0) +
      (this._toPublish.get(channelName)?.length || 0);
  }

  getToTriggerStateMovements(): StateMovement[] {
    return this.stateMovements;
  }

  triggerStateMovements(...movements: StateMovement[]) {
    this.stateMovements = this.stateMovements.concat(movements);
  }

  get toPublishInternalChannel(): Map<string, EncodedObject[]> {
    return this._toPublish;
  }

  publishToInternalChannel(channelName: string, value: unknown) {
    if (!this.internalChannelNames.validateKey(channelName)) {
      throw new Error(`channel name ${channelName} is not registered`);
    }

    const channel = this._toPublish.get(channelName);
    if (!channel) {
      throw new Error(`channel ${channelName} not found`);
    }
    const encoded = this.encoder.encode(value);
    channel.push(encoded);
  }

  validateInternalChannelName(channelName: string, value?: unknown) {
    const [isValid, validator] = this.internalChannelNames.validateKeyAndData(
      channelName,
    );
    if (!isValid) {
      throw new Error(
        `InternalChannel (${channelName}) value is not of correct type`,
      );
    }
    if (value) {
      validator(value);
    }
  }

  validateSignalChannelName(channelName: string, value: unknown) {
    const [isValid, validator] = this.signalChannelNames.validateKeyAndData(
      channelName,
    );
    if (!isValid) {
      throw new Error(
        `SignalChannel (${channelName}) value is not of correct type`,
      );
    }
    if (value) {
      validator(value);
    }
  }
}
