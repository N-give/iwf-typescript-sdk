import { SearchAttributeValueType } from "../../gen/iwfidl/src/models/SearchAttributeValueType.ts";
import { SearchAttribute } from "../../gen/iwfidl/src/models/SearchAttribute.ts";

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

function isType<T>(sa: SearchAttribute): (t: SearchAttribute) => boolean {
  switch (sa.valueType) {
    case SearchAttributeValueType.Text:
    case SearchAttributeValueType.Keyword:
      return (s: SearchAttribute) => {
        return s.stringValue !== null && s.stringValue !== undefined;
      };

    case SearchAttributeValueType.KeywordArray:
      return (s: SearchAttribute) => {
        return s.stringArrayValue !== null && s.stringArrayValue !== undefined;
      };

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
