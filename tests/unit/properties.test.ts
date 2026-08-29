import { describe, expect, it } from "vitest";
import { parseProperties } from "@/lib/properties";

describe("parseProperties", () => {
  it("maps keys to trimmed values and skips comments", () => {
    // Arrange
    const source = `
# Contact
linkedin.url = https://www.linkedin.com/in/facundokrens
contact.email=facundokrens@outlook.com

! ignored
contact.phone = +54 11 2478 9582
`;

    // Act
    const props = parseProperties(source);

    // Assert
    expect(props).toEqual({
      "linkedin.url": "https://www.linkedin.com/in/facundokrens",
      "contact.email": "facundokrens@outlook.com",
      "contact.phone": "+54 11 2478 9582",
    });
  });

  it("ignores lines without a key before =", () => {
    // Arrange
    const source = "=orphan\n=also-orphan\nvalid.key=ok";

    // Act
    const props = parseProperties(source);

    // Assert
    expect(props).toEqual({ "valid.key": "ok" });
  });
});
