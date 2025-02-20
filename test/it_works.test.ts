import assert from "node:assert/strict";
import { describe, it } from "node:test";

function adder(a: number, b: number) {
  return a + b;
}

describe("testing that tests run", () => {
  it("2 + 2 = 4", () => {
    assert.equal(4, adder(2, 2));
  });
});
