import { describe, expect, it } from "vitest";
import { BPMN_DIAGRAM_BOUNDS, bpmnFitTransform } from "@/lib/bpmn-view";

describe("bpmnFitTransform", () => {
  it("scales the pool to fill a matching viewport and keeps the origin", () => {
    // Arrange
    const viewport = { width: 2910, height: 750 };

    // Act
    const fit = bpmnFitTransform(viewport);

    // Assert
    expect(fit).toEqual({
      scale: 0.5,
      x: BPMN_DIAGRAM_BOUNDS.x,
      y: BPMN_DIAGRAM_BOUNDS.y,
    });
  });

  it("centers the pool when the viewport is taller than the diagram", () => {
    // Arrange
    const viewport = { width: 2910, height: 1500 };

    // Act
    const fit = bpmnFitTransform(viewport);

    // Assert
    expect(fit).toEqual({
      scale: 0.5,
      x: BPMN_DIAGRAM_BOUNDS.x,
      y: BPMN_DIAGRAM_BOUNDS.y - 750,
    });
  });

  it("returns null when the viewport has no area", () => {
    // Arrange
    const viewport = { width: 0, height: 400 };

    // Act
    const fit = bpmnFitTransform(viewport);

    // Assert
    expect(fit).toBeNull();
  });
});
