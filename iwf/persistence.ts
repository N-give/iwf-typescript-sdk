import { SearchAttributeValueType } from "../gen/iwfidl/src/models/SearchAttributeValueType.ts";
import { KeyValue } from "../gen/iwfidl/src/models/KeyValue.ts";
import { SearchAttribute } from "../gen/iwfidl/src/models/SearchAttribute.ts";
import { IObjectEncoder } from "./object_encoder.ts";
import { EncodedObject } from "../gen/iwfidl/src/models/EncodedObject.ts";
import {
  createSearchAttribute,
  getSearchAttributeValue,
  matchesSearchAttributeType,
  SearchAtributeTypeMapper,
  SearchAttributeTSType,
} from "./utils/search_attributes.ts";
import { StatSyncOptions } from "node:fs";

export class Persistence {
  encoder: IObjectEncoder;

  dataAttrsKeyMap: Map<string, boolean>;
  currentDataAttributes: Map<string, EncodedObject>;
  dataAttributesToReturn: Map<string, EncodedObject>;

  recordedEvents: Map<string, EncodedObject>;
  currentStateExeLocal: Map<string, EncodedObject>;
  stateExeLocalToReturn: Map<string, EncodedObject>;

  saKeyToType: Map<string, SearchAttributeValueType>;
  saCurrent: Map<
    SearchAttributeValueType,
    Map<string, SearchAtributeTypeMapper[SearchAttributeValueType]>
  >;
  saToReturn: Map<
    SearchAttributeValueType,
    Map<string, SearchAtributeTypeMapper[SearchAttributeValueType]>
  >;

  constructor(
    encoder: IObjectEncoder,
    dataAttrsKeyMap: Map<string, boolean>,
    saKeyToType: Map<string, SearchAttributeValueType>,
    dataObjects: KeyValue[],
    searchAttributes: SearchAttribute[],
    stateLocals: KeyValue[],
  ) {
    this.encoder = encoder;
    this.dataAttrsKeyMap = dataAttrsKeyMap;
    this.currentDataAttributes = new Map();
    this.dataAttributesToReturn = new Map();
    this.recordedEvents = new Map();
    this.currentStateExeLocal = new Map();
    this.stateExeLocalToReturn = new Map();
    this.saKeyToType = saKeyToType;

    this.saCurrent = new Map([
      [SearchAttributeValueType.Keyword, new Map()],
      [SearchAttributeValueType.Text, new Map()],
      [SearchAttributeValueType.KeywordArray, new Map()],
      [SearchAttributeValueType.Double, new Map()],
      [SearchAttributeValueType.Int, new Map()],
      [SearchAttributeValueType.Bool, new Map()],
      [SearchAttributeValueType.Datetime, new Map()],
    ]);

    this.saToReturn = new Map([
      [SearchAttributeValueType.Keyword, new Map()],
      [SearchAttributeValueType.Text, new Map()],
      [SearchAttributeValueType.KeywordArray, new Map()],
      [SearchAttributeValueType.Double, new Map()],
      [SearchAttributeValueType.Int, new Map()],
      [SearchAttributeValueType.Bool, new Map()],
      [SearchAttributeValueType.Datetime, new Map()],
    ]);

    dataObjects.forEach((d) => {
      this.currentDataAttributes.set(d.key || `${d}`, d.value!);
    });

    stateLocals.forEach((l) => {
      this.currentDataAttributes.set(l.key || `${l}`, l.value!);
    });

    searchAttributes.forEach((s) => {
      this.saCurrent
        .get(s.valueType!)
        ?.set(
          s.key || `${s}`,
          getSearchAttributeValue(s),
        );
    });
  }

  getDataAttribute(key: string): unknown {
    if (!this.dataAttrsKeyMap.has(key)) {
      throw new Error(`key ${key} is not regestered as a data object`);
    }
    const encoded = this.currentDataAttributes.get(key);
    if (!encoded) {
      throw new Error(`key ${key} does not contain any data`);
    }
    return this.encoder.decode(encoded);
  }

  setDataAttribute(key: string, value: unknown) {
    if (!this.dataAttrsKeyMap.has(key)) {
      throw new Error(`key ${key} is not regestered as a data object`);
    }
    const encoded = this.encoder.encode(value);
    this.dataAttributesToReturn.set(key, encoded);
    this.currentDataAttributes.set(key, encoded);
  }

  getSearchAttribute<T extends SearchAttributeValueType>(
    key: string,
  ): SearchAtributeTypeMapper[T] | undefined {
    const saType = this.saKeyToType.get(key);
    if (saType === null || saType === undefined) {
      throw new Error(`key ${key} has not been registered`);
    }

    const value = this.saCurrent.get(saType)?.get(key);
    if (value === null || value === undefined) {
      throw new Error(
        `key ${key} has not been registered as ${saType} search attribute`,
      );
    }

    return value as SearchAtributeTypeMapper[T];
  }

  setSearchAttribute(
    key: string,
    value: unknown,
  ) {
    const saType = this.saKeyToType.get(key);
    if (saType === null || saType === undefined) {
      throw new Error(`key ${key} has not been registered`);
    }
    if (!matchesSearchAttributeType(saType, value)) {
      throw new Error(`value is not of type ${saType}`);
    }
    this.saCurrent.get(saType)?.set(key, value);
  }

  getStateExecutionLocal(key: string): unknown {
    const state = this.currentStateExeLocal.get(key);
    if (state === null || state === undefined) {
      throw new Error(`state execution local ${key} is not registered`);
    }
    return this.encoder.decode(state);
  }

  setStateExecutionLocal(key: string, value: unknown) {
    const encoded = this.encoder.encode(value);
    this.currentStateExeLocal.set(key, encoded);
    this.stateExeLocalToReturn.set(key, encoded);
  }

  recordEvent(key: string, value: unknown) {
    const encoded = this.encoder.encode(value);
    this.recordedEvents.set(key, encoded);
  }

  goToReturn(): unknown {
    return {
      dataObjectsToReturn: this.dataAttributesToReturn
        .entries().map((key, value) => {
          return { key, value };
        }),

      stateLocalToReturn: this.stateExeLocalToReturn
        .entries().map((key, value) => {
          return { key, value };
        }),

      recordEvents: this.recordedEvents
        .entries().map((key, value) => {
          return { key, value };
        }),

      searchAttributes: Array.from(
        this.saToReturn
          .entries().flatMap(([saType, sas]) => {
            return sas.entries().map(
              ([key, sa]) => {
                return createSearchAttribute(key, saType, sa);
              },
            );
          }),
      ),
    };
  }
}
