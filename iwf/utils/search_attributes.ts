import { SearchAttribute, SearchAttributeValueType } from "iwfidl";

export type SearchAttributeTSType =
  | string
  | string[]
  | number
  | boolean
  | Date;

export interface SearchAtributeTypeMapper {
  [SearchAttributeValueType.Keyword]: string;
  [SearchAttributeValueType.Text]: string;
  [SearchAttributeValueType.KeywordArray]: string[];
  [SearchAttributeValueType.Double]: number;
  [SearchAttributeValueType.Int]: number;
  [SearchAttributeValueType.Bool]: boolean;
  [SearchAttributeValueType.Datetime]: string;
}

export function getSearchAttributeValue<T extends SearchAttributeValueType>(
  sa: SearchAttribute,
): SearchAtributeTypeMapper[T] {
  switch (sa.valueType) {
    case SearchAttributeValueType.Text, SearchAttributeValueType.Keyword: {
      const v: unknown = sa.stringValue;
      if (!matchesSearchAttributeType(sa.valueType, v)) {
        throw new Error(
          `search attribute ${sa} value is not of type ${sa.valueType}`,
        );
      }
      return v as SearchAtributeTypeMapper[T];
    }

    case SearchAttributeValueType.KeywordArray: {
      const v: unknown = sa.stringArrayValue;
      if (!matchesSearchAttributeType(sa.valueType, v)) {
        throw new Error(
          `search attribute ${sa} value is not of type ${sa.valueType}`,
        );
      }
      return v as SearchAtributeTypeMapper[T];
    }

    case SearchAttributeValueType.Double: {
      const v: unknown = sa.doubleValue;
      if (!matchesSearchAttributeType(sa.valueType, v)) {
        throw new Error(
          `search attribute ${sa} value is not of type ${sa.valueType}`,
        );
      }
      return v as SearchAtributeTypeMapper[T];
    }

    case SearchAttributeValueType.Int: {
      const v: unknown = sa.integerValue;
      if (!matchesSearchAttributeType(sa.valueType, v)) {
        throw new Error(
          `search attribute ${sa} value is not of type ${sa.valueType}`,
        );
      }
      return v as SearchAtributeTypeMapper[T];
    }

    case SearchAttributeValueType.Bool: {
      const v: unknown = sa.boolValue;
      if (!matchesSearchAttributeType(sa.valueType, v)) {
        throw new Error(
          `search attribute ${sa} value is not of type ${sa.valueType}`,
        );
      }
      return v as SearchAtributeTypeMapper[T];
    }

    case SearchAttributeValueType.Datetime: {
      const v: unknown = sa.stringValue;
      if (!matchesSearchAttributeType(sa.valueType, v)) {
        throw new Error(
          `search attribute ${sa} value is not of type ${sa.valueType}`,
        );
      }
      return Date.parse(v as unknown as string) as SearchAtributeTypeMapper[T];
    }

    default:
      throw new Error(`unsupported search attribute type ${sa.valueType}`);
  }
}

export function matchesSearchAttributeType<T extends SearchAttributeValueType>(
  t: T,
  v: null | undefined | unknown,
): v is SearchAtributeTypeMapper[T] {
  if (v === null || v === undefined) {
    return false;
  }

  switch (t) {
    case SearchAttributeValueType.Text, SearchAttributeValueType.Keyword: {
      return typeof v === "string";
    }

    case SearchAttributeValueType.KeywordArray: {
      if (!Array.isArray(v)) {
        return false;
      }
      return !v.some((e) => typeof e !== "string");
    }

    case SearchAttributeValueType.Double, SearchAttributeValueType.Int: {
      return typeof v === "number";
    }

    case SearchAttributeValueType.Bool: {
      return typeof v === "boolean";
    }

    case SearchAttributeValueType.Datetime: {
      return typeof v === "string";
    }

    default:
      return false;
  }
}

export function createSearchAttribute<T extends SearchAttributeValueType>(
  key: string,
  valueType: T,
  value: SearchAttributeTSType,
): SearchAttribute {
  const ret: SearchAttribute = {
    key,
    valueType,
  };

  switch (valueType) {
    case SearchAttributeValueType.Text, SearchAttributeValueType.Keyword: {
      ret.stringValue = value as string;
      break;
    }

    case SearchAttributeValueType.KeywordArray: {
      ret.stringArrayValue = value as string[];
      break;
    }

    case SearchAttributeValueType.Double: {
      ret.doubleValue = value as number;
      break;
    }

    case SearchAttributeValueType.Int: {
      ret.integerValue = value as number;
      break;
    }

    case SearchAttributeValueType.Bool: {
      ret.boolValue = value as boolean;
      break;
    }

    case SearchAttributeValueType.Datetime: {
      ret.stringValue = value.toString();
      break;
    }

    default:
      throw new Error(`value type ${valueType} is not supported`);
  }

  return ret;
}
