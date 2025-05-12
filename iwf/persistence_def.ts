import { SearchAttributeValueType } from "iwfidl";
import { DataSources } from "./data_sources.ts";

export type PersistenceFieldDef<T extends DataSources> =
  & {
    key: string;
    fieldType: T;
  }
  & ({
    fieldType: DataSources.DATA_ATTRIBUTE;
    isPrefix: boolean;
    validator: <V>(v: unknown) => v is V;
  } | {
    fieldType: DataSources.SEARCH_ATTRIBUTE;
    searchAttributType: SearchAttributeValueType;
  });

export function dataAttributeDef(
  key: string,
  validator: <V>(v: unknown) => v is V,
): PersistenceFieldDef<DataSources.DATA_ATTRIBUTE> {
  return {
    key,
    fieldType: DataSources.DATA_ATTRIBUTE,
    isPrefix: false,
    validator,
  };
}

export function dataAttributePrefix(
  key: string,
  validator: <T>(v: unknown) => v is T,
): PersistenceFieldDef<DataSources.DATA_ATTRIBUTE> {
  return {
    key,
    fieldType: DataSources.DATA_ATTRIBUTE,
    isPrefix: true,
    validator,
  };
}

export function searchAttributeDef(
  key: string,
  saType: SearchAttributeValueType,
): PersistenceFieldDef<DataSources.SEARCH_ATTRIBUTE> {
  return {
    key,
    fieldType: DataSources.SEARCH_ATTRIBUTE,
    searchAttributType: saType,
  };
}
