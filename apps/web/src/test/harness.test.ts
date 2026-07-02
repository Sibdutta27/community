import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs a passing sample test", () => {
    expect(1 + 1).toBe(2);
  });
});
