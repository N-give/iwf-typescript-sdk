import { EncodedObject } from "iwfidl";

export interface IObjectEncoder {
  getEncodingType(): string;
  encode(unencoded: unknown): EncodedObject;
  decode(encoded: EncodedObject): unknown;
}
