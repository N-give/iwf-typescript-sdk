import { EncodedObject } from "../gen/iwfidl/src/models/EncodedObject.ts";

export interface IObjectEncoder {
  getEncodingType(): string;
  encode(unencoded: unknown): EncodedObject;
  decode(encoded: EncodedObject): unknown;
}
