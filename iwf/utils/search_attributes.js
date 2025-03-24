"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchAttributeValue = getSearchAttributeValue;
exports.matchesSearchAttributeType = matchesSearchAttributeType;
exports.createSearchAttribute = createSearchAttribute;
var iwfidl_1 = require("iwfidl");
function getSearchAttributeValue(sa) {
    switch (sa.valueType) {
        case iwfidl_1.SearchAttributeValueType.Text: {
            // passthrough to keyword because they should be handled the same way
        }
        case iwfidl_1.SearchAttributeValueType.Keyword: {
            var v = sa.stringValue;
            if (!matchesSearchAttributeType(sa.valueType, v)) {
                throw new Error("search attribute ".concat(sa, " value is not of type ").concat(sa.valueType));
            }
            return v;
        }
        case iwfidl_1.SearchAttributeValueType.KeywordArray: {
            var v = sa.stringArrayValue;
            if (!matchesSearchAttributeType(sa.valueType, v)) {
                throw new Error("search attribute ".concat(sa, " value is not of type ").concat(sa.valueType));
            }
            return v;
        }
        case iwfidl_1.SearchAttributeValueType.Double: {
            var v = sa.doubleValue;
            if (!matchesSearchAttributeType(sa.valueType, v)) {
                throw new Error("search attribute ".concat(sa, " value is not of type ").concat(sa.valueType));
            }
            return v;
        }
        case iwfidl_1.SearchAttributeValueType.Int: {
            var v = sa.integerValue;
            if (!matchesSearchAttributeType(sa.valueType, v)) {
                throw new Error("search attribute ".concat(sa, " value is not of type ").concat(sa.valueType));
            }
            return v;
        }
        case iwfidl_1.SearchAttributeValueType.Bool: {
            var v = sa.boolValue;
            if (!matchesSearchAttributeType(sa.valueType, v)) {
                throw new Error("search attribute ".concat(sa, " value is not of type ").concat(sa.valueType));
            }
            return v;
        }
        case iwfidl_1.SearchAttributeValueType.Datetime: {
            var v = sa.stringValue;
            if (!matchesSearchAttributeType(sa.valueType, v)) {
                throw new Error("search attribute ".concat(sa, " value is not of type ").concat(sa.valueType));
            }
            return Date.parse(v);
        }
        default:
            throw new Error("unsupported search attribute type ".concat(sa.valueType));
    }
}
function matchesSearchAttributeType(t, v) {
    if (v === null || v === undefined) {
        return false;
    }
    switch (t) {
        case iwfidl_1.SearchAttributeValueType.Text, iwfidl_1.SearchAttributeValueType.Keyword: {
            return typeof v === "string";
        }
        case iwfidl_1.SearchAttributeValueType.KeywordArray: {
            if (!Array.isArray(v)) {
                return false;
            }
            return !v.some(function (e) { return typeof e !== "string"; });
        }
        case iwfidl_1.SearchAttributeValueType.Double, iwfidl_1.SearchAttributeValueType.Int: {
            return typeof v === "number";
        }
        case iwfidl_1.SearchAttributeValueType.Bool: {
            return typeof v === "boolean";
        }
        case iwfidl_1.SearchAttributeValueType.Datetime: {
            return v === "string";
        }
        default:
            return false;
    }
}
function createSearchAttribute(key, valueType, value) {
    var ret = {
        key: key,
        valueType: valueType,
    };
    switch (valueType) {
        case (iwfidl_1.SearchAttributeValueType.Text, iwfidl_1.SearchAttributeValueType.Keyword): {
            ret.stringValue = value;
            break;
        }
        case iwfidl_1.SearchAttributeValueType.KeywordArray: {
            ret.stringArrayValue = value;
            break;
        }
        case iwfidl_1.SearchAttributeValueType.Double: {
            ret.doubleValue = value;
            break;
        }
        case iwfidl_1.SearchAttributeValueType.Int: {
            ret.doubleValue = value;
            break;
        }
        case iwfidl_1.SearchAttributeValueType.Bool: {
            ret.boolValue = value;
            break;
        }
        case iwfidl_1.SearchAttributeValueType.Datetime: {
            ret.stringValue = value.toString();
            break;
        }
        default:
            throw new Error("value type ".concat(valueType, " is not supported"));
    }
    return ret;
}
