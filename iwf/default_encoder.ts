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
    return encoded.data ? JSON.parse(encoded.data || "") : null;
  },
};
