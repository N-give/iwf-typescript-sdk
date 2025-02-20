import { SearchAttributeValueType } from "../gen/iwfidl/src";
import { SearchAttribute } from "../gen/iwfidl/src/models/SearchAttribute.ts";

export enum PersistenceFieldType {
  DATA_ATTRIBUTE,
  SEARCH_ATTRIBUTE,
}

export type PersistenceFieldDef =
  & {
    key: string;
  }
  & ({
    fieldType: PersistenceFieldType.DATA_ATTRIBUTE;
  } | {
    fieldType: PersistenceFieldType.SEARCH_ATTRIBUTE;
    searchAttributType: SearchAttributeValueType;
  });

export function dataAttributeDey(key: string): PersistenceFieldDef {
  return {
    key,
    fieldType: PersistenceFieldType.DATA_ATTRIBUTE,
  };
}

export function searchAttributeDey(
  key: string,
  saType: SearchAttributeValueType,
): PersistenceFieldDef {
  return {
    key,
    fieldType: PersistenceFieldType.SEARCH_ATTRIBUTE,
    searchAttributType: saType,
  };
}

export function getSearchAttributeValue(sa: SearchAttribute): unknown {
  switch (sa.valueType) {
    case SearchAttributeValueType.Text:
    case SearchAttributeValueType.Keyword:
      return sa.stringValue;

    case SearchAttributeValueType.KeywordArray:
      return sa.stringArrayValue;

    case SearchAttributeValueType.Double:
      return sa.doubleValue;

    case SearchAttributeValueType.Int:
      return sa.integerValue;

    case SearchAttributeValueType.Bool:
      return sa.boolValue;

    case SearchAttributeValueType.Datetime:
      return sa.stringValue && new Date(sa.stringValue);

    default:
      throw new Error(`unsupported search attribute type ${sa.valueType}`);
  }
}
