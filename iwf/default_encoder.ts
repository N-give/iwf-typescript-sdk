import { EncodedObject } from "iwfidl";
import { IObjectEncoder } from "./object_encoder.ts";

export const DEFAULT_ENCODER: IObjectEncoder = {
  getEncodingType: function (): string {
    return "json";
  },
  encode: function (unencoded: unknown): EncodedObject {
    return {
      encoding: this.getEncodingType(),
      data: JSON.stringify(unencoded),
    };
  },
  decode: function (encoded: EncodedObject): unknown {
    console.log(`${JSON.stringify(encoded, null, 2)}`);
    return JSON.parse(encoded.data || "{}");
  },
};
