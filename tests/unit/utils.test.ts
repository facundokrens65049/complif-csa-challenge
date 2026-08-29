import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    // Arrange
    const classes = ["px-2", "py-1"];

    // Act
    const result = cn(...classes);

    // Assert
    expect(result).toBe("px-2 py-1");
  });

  it("merges conflicting Tailwind utilities to the last one", () => {
    // Arrange
    const classes = ["p-2", "p-4"];

    // Act
    const result = cn(...classes);

    // Assert
    expect(result).toBe("p-4");
  });
});
