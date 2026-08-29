import { describe, expect, it } from "vitest";
import {
  NAV_SECTION_IDS,
  resolveActiveSection,
  sectionIdFromHash,
  type SectionAnchor,
} from "@/lib/active-section";

const sections: SectionAnchor[] = [
  { id: "sql", top: 900 },
  { id: "apis", top: 1800 },
  { id: "tech", top: 2600 },
  { id: "procesos-1", top: 3400 },
  { id: "contact", top: 5000 },
];

describe("NAV_SECTION_IDS", () => {
  it("lists nav targets in document order", () => {
    // Arrange
    const expected = ["sql", "apis", "tech", "procesos-1", "contact"];

    // Act
    const ids = [...NAV_SECTION_IDS];

    // Assert
    expect(ids).toEqual(expected);
  });
});

describe("sectionIdFromHash", () => {
  it("returns a nav id from a hash", () => {
    // Arrange
    const hash = "#apis";

    // Act
    const id = sectionIdFromHash(hash);

    // Assert
    expect(id).toBe("apis");
  });

  it("accepts a bare section id", () => {
    // Arrange
    const hash = "contact";

    // Act
    const id = sectionIdFromHash(hash);

    // Assert
    expect(id).toBe("contact");
  });

  it("ignores hashes that are not nav sections", () => {
    // Arrange
    const hash = "#home";

    // Act
    const id = sectionIdFromHash(hash);

    // Assert
    expect(id).toBeNull();
  });
});

describe("resolveActiveSection", () => {
  it("returns null when there are no sections", () => {
    // Arrange
    const empty: SectionAnchor[] = [];
    const viewport = {
      scrollY: 400,
      offset: 80,
      height: 800,
      documentHeight: 6000,
    };

    // Act
    const active = resolveActiveSection(empty, viewport);

    // Assert
    expect(active).toBeNull();
  });

  it("returns null above the first nav section", () => {
    // Arrange
    const viewport = {
      scrollY: 0,
      offset: 80,
      height: 800,
      documentHeight: 6200,
    };

    // Act
    const active = resolveActiveSection(sections, viewport);

    // Assert
    expect(active).toBeNull();
  });

  it("activates a section once the probe line reaches its top", () => {
    // Arrange
    const viewport = {
      scrollY: 820,
      offset: 80,
      height: 800,
      documentHeight: 6200,
    };

    // Act
    const active = resolveActiveSection(sections, viewport);

    // Assert
    expect(active).toBe("sql");
  });

  it("keeps the last section whose top is at or above the probe", () => {
    // Arrange
    const viewport = {
      scrollY: 2700,
      offset: 80,
      height: 800,
      documentHeight: 6200,
    };

    // Act
    const active = resolveActiveSection(sections, viewport);

    // Assert
    expect(active).toBe("tech");
  });

  it("activates the last section at the bottom of the document", () => {
    // Arrange
    const viewport = {
      scrollY: 5400,
      offset: 80,
      height: 800,
      documentHeight: 6200,
    };

    // Act
    const active = resolveActiveSection(sections, viewport);

    // Assert
    expect(active).toBe("contact");
  });

  it("sorts anchors by document position", () => {
    // Arrange
    const reversed = [...sections].reverse();
    const viewport = {
      scrollY: 1850,
      offset: 80,
      height: 800,
      documentHeight: 6200,
    };

    // Act
    const active = resolveActiveSection(reversed, viewport);

    // Assert
    expect(active).toBe("apis");
  });
});
