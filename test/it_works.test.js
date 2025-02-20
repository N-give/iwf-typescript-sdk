"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
function adder(a, b) {
    return a + b;
}
(0, node_test_1.describe)("testing that tests run", () => {
    (0, node_test_1.it)("2 + 2 = 4", () => {
        strict_1.default.equal(4, adder(2, 2));
    });
});
