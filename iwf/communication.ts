import { EncodedObject } from "iwfidl";
import { IObjectEncoder } from "./object_encoder.ts";
import { StateMovement } from "./state_movement.ts";
import { TypeStore } from "./type_store.ts";
import { DataSources } from "./data_sources.ts";

export class Communication {
  encoder: IObjectEncoder;
  internalChannelNames: TypeStore<DataSources.INTERNAL_CHANNEL>;
  private _toPublishInternalChannel: Map<string, EncodedObject[]>;
  stateMovements: StateMovement[];

  constructor(
    encoder: IObjectEncoder,
    internalChannelNames: TypeStore<DataSources.INTERNAL_CHANNEL> =
      new TypeStore(DataSources.INTERNAL_CHANNEL),
  ) {
    this.encoder = encoder;
    this.internalChannelNames = internalChannelNames;
    this._toPublishInternalChannel = new Map();
    this.stateMovements = [];
  }

  getToTriggerStateMovements(): StateMovement[] {
    return this.stateMovements;
  }

  triggerStateMovements(...movements: StateMovement[]) {
    this.stateMovements = this.stateMovements.concat(movements);
  }

  get toPublishInternalChannel(): Map<string, EncodedObject[]> {
    return this._toPublishInternalChannel;
  }

  publishToInternalChannel(channelName: string, value: unknown) {
    if (!this.internalChannelNames.validateKey(channelName)) {
      throw new Error(`channel name ${channelName} is not registered`);
    }

    const channel = this._toPublishInternalChannel.get(channelName);
    if (!channel) {
      throw new Error(`channel ${channelName} not found`);
    }
    const encoded = this.encoder.encode(value);
    channel.push(encoded);
  }
}
