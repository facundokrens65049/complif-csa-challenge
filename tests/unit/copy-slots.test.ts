import { describe, expect, it } from "vitest";
import { isFilled } from "@/lib/copy-slots";

describe("isFilled", () => {
  it("treats trimmed non-empty strings as filled", () => {
    // Arrange
    const values = ["ok", "  sí  ", "", "   ", undefined];

    // Act
    const filled = values.map((value) => isFilled(value));

    // Assert
    expect(filled).toEqual([true, true, false, false, false]);
  });
});
