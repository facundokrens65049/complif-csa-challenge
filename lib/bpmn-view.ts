/** Collaboration pool in `docs/cliente-adquisition.bpmn` plus a little margin. */
export const BPMN_DIAGRAM_BOUNDS = {
  x: 60,
  y: 16,
  width: 5820,
  height: 1500,
};

export function bpmnFitTransform(
  viewport: { width: number; height: number },
  diagram: {
    x: number;
    y: number;
    width: number;
    height: number;
  } = BPMN_DIAGRAM_BOUNDS,
): { x: number; y: number; scale: number } | null {
  if (viewport.width <= 0 || viewport.height <= 0) return null;
  if (diagram.width <= 0 || diagram.height <= 0) return null;
  const scale = Math.min(
    viewport.width / diagram.width,
    viewport.height / diagram.height,
  );
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const extraX = viewport.width / scale - diagram.width;
  const extraY = viewport.height / scale - diagram.height;
  return {
    scale,
    x: diagram.x - extraX / 2,
    y: diagram.y - extraY / 2,
  };
}
