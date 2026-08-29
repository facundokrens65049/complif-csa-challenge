import type { MepPoint, MepStats } from "@/lib/types";

export const MEP_CURRENCY = "ARS";

export function formatMep(value: number, digits = 2) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatMepAmount(value: number, digits = 2) {
  return `${formatMep(value, digits)} ${MEP_CURRENCY}`;
}

export function formatMepRange(min: number, max: number, digits = 1) {
  return `${formatMep(min, digits)} – ${formatMep(max, digits)} ${MEP_CURRENCY}`;
}

export function formatClock(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

export function formatRange(from: string, to: string) {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${from} → ${to}`;
  }
  const day = start.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  return `${day} · ${formatClock(from)} – ${formatClock(to)}`;
}

export const PRICE_SCALE_PAD = 0.04;

export function isQuotedPrice(value: number) {
  return Number.isFinite(value) && value > 0;
}

export function mepQuotedField<T extends MepPoint>(
  points: readonly T[],
  field: "venta" | "compra",
): T[] {
  return points.filter((point) => isQuotedPrice(point[field]));
}

export function mepPriceScaleRange(
  points: MepPoint[],
): { from: number; to: number } | null {
  if (points.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const point of points) {
    for (const value of [point.venta, point.compra]) {
      if (!isQuotedPrice(value)) continue;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  const span = max - min;
  const pad =
    span === 0 ? Math.max(Math.abs(min) * PRICE_SCALE_PAD, 0.01) : span * PRICE_SCALE_PAD;
  return { from: min - pad, to: max + pad };
}

function extrema(values: number[]) {
  const quoted = values.filter(isQuotedPrice);
  if (quoted.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...quoted), max: Math.max(...quoted) };
}

export function getMepStats(points: MepPoint[]): MepStats | null {
  if (points.length === 0) return null;
  const last = points[points.length - 1];
  const ventaRange = extrema(points.map((p) => p.venta));
  const compraRange = extrema(points.map((p) => p.compra));
  return {
    lastVenta: last.venta,
    lastCompra: last.compra,
    spread: last.compra - last.venta,
    minVenta: ventaRange.min,
    maxVenta: ventaRange.max,
    minCompra: compraRange.min,
    maxCompra: compraRange.max,
    count: points.length,
    from: points[0].datetime,
    to: last.datetime,
  };
}
