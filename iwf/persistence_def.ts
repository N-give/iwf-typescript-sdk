import { SearchAttributeValueType } from "../gen/iwfidl/src/models/SearchAttributeValueType.ts";
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

export function searchAttributeDef(
  key: string,
  saType: SearchAttributeValueType,
): PersistenceFieldDef {
  return {
    key,
    fieldType: PersistenceFieldType.SEARCH_ATTRIBUTE,
    searchAttributType: saType,
  };
}
