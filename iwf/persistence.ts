import { SearchAttributeValueType } from "../gen/iwfidl/src/models/SearchAttributeValueType.ts";
import { KeyValue } from "../gen/iwfidl/src/models/KeyValue.ts";
import { SearchAttribute } from "../gen/iwfidl/src/models/SearchAttribute.ts";
import { IObjectEncoder } from "./object_encoder.ts";
import { EncodedObject } from "../gen/iwfidl/src/models/EncodedObject.ts";
import { getSearchAttributeValue } from "./persistence_def.ts";

export class Persistence {
  encoder: IObjectEncoder;

  // for: data attributes
  dataAttributesKeyMap: Map<string, boolean>;
  currentDataAttributes: Map<string, EncodedObject>;
  dataAttributesToReturn: Map<string, EncodedObject>;

  // for: stateExecutionLocals
  recordedEvents: Map<string, EncodedObject>;
  currentStateExeLocal: Map<string, EncodedObject>;
  stateExeLocalToReturn: Map<string, EncodedObject>;

  // for: search attributes
  saKeyToType: Map<string, SearchAttributeValueType>;
  saCurrentIntValue: Map<string, number>;
  saIntToReturn: Map<string, number>;
  saCurrentStringValue: Map<string, string>;
  saStringToReturn: Map<string, string>;
  saCurrentDoubleValue: Map<string, number>;
  saDoubleToReturn: Map<string, number>;
  saCurrentBoolValue: Map<string, boolean>;
  saBoolToReturn: Map<string, boolean>;
  saCurrentStrArrValue: Map<string, string[]>;
  saStrArrToReturn: Map<string, string[]>;

  constructor(
    encoder: IObjectEncoder,
    dataAttrsKeyMap: Map<string, boolean>,
    saKeyToType: Map<string, SearchAttributeValueType>,
    dataObjects: KeyValue[],
    searchAttributes: SearchAttribute[],
    stateLocals: KeyValue[],
  ) {
    this.encoder = encoder;
    this.dataAttributesKeyMap = new Map();
    this.currentDataAttributes = new Map();
    this.dataAttributesToReturn = new Map();
    this.recordedEvents = new Map();
    this.currentStateExeLocal = new Map();
    this.stateExeLocalToReturn = new Map();
    this.saKeyToType = new Map();
    this.saCurrentIntValue = new Map();
    this.saIntToReturn = new Map();
    this.saCurrentStringValue = new Map();
    this.saStringToReturn = new Map();
    this.saCurrentDoubleValue = new Map();
    this.saDoubleToReturn = new Map();
    this.saCurrentBoolValue = new Map();
    this.saBoolToReturn = new Map();
    this.saCurrentStrArrValue = new Map();
    this.saStrArrToReturn = new Map();

    dataObjects.forEach((d) => {
      this.currentDataAttributes.set(d.key || `${d}`, d.value || `${d}`);
    });

    stateLocals.forEach((l) => {
      this.currentDataAttributes.set(l.key || `${l}`, l.value || `${l}`);
    });

    searchAttributes.forEach((s) => {
      this.currentDataAttributes.set(
        s.key || `${s}`,
        getSearchAttributeValue(s),
      );
    });
  }
}
