import { EncodedObject } from "iwfidl";
import { IObjectEncoder } from "./object_encoder.ts";
import { StateMovement } from "./state_movement.ts";

export class Communication {
  encoder: IObjectEncoder;
  internalChannelNames: Map<string, boolean>;
  private _toPublishInternalChannel: Map<string, EncodedObject[]>;
  stateMovements: StateMovement[];

  constructor(
    encoder: IObjectEncoder,
    internalChannelNames: Map<string, boolean>,
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
    return this.toPublishInternalChannel;
  }

  publishToInternalChannel(channelName: string, value: unknown) {
    if (!this.internalChannelNames.has(channelName)) {
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
