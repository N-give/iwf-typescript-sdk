import { EncodedObject } from "../gen/iwfidl/src/models/EncodedObject.ts";

export interface ObjectEncoder {
  getEncodingType(): string;
  encode(unencoded: unknown): EncodedObject;
  decode(encoded: EncodedObject): unknown;
}
