import { describe, expect, it } from "vitest";
import { greet } from "./greet.js";

describe("greet", () => {
  it("returns a personalized greeting when given a name", () => {
    expect(greet("Ada")).toBe("Hello, Ada!");
  });

  it("falls back to a generic greeting when the name is blank", () => {
    expect(greet("   ")).toBe("Hello, world!");
  });
});
