"use client";

import { useEffect, useRef, useState } from "react";
import {
  ColorType,
  CrosshairMode,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  formatClock,
  formatMepAmount,
  isQuotedPrice,
  mepQuotedField,
  mepPriceScaleRange,
} from "@/lib/format";
import type { MepPoint } from "@/lib/types";

const CHART_BG = "#0f1c28";
const VENTA = "#2dd4bf";
const COMPRA = "#f4c38b";

type Hover = {
  time: string;
  venta: number;
  compra: number;
};

function paneSize(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(rect.width)),
    height: Math.max(1, Math.round(rect.height)),
  };
}

function uniqueTimes(points: MepPoint[]) {
  const seen = new Set<number>();
  return points.map((point) => {
    let t = Math.floor(new Date(point.datetime).getTime() / 1000);
    if (!Number.isFinite(t)) t = seen.size;
    while (seen.has(t)) t += 1;
    seen.add(t);
    return { ...point, t: t as UTCTimestamp };
  });
}

export function MepChart({
  points,
  labels,
}: {
  points: MepPoint[];
  labels: { title: string; sell: string; buy: string };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const ventaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const compraRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const mapped = uniqueTimes(points);
  const last = mapped[mapped.length - 1];

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapped.length === 0) return;

    let cancelled = false;
    let chart: IChartApi | null = null;
    let resize: ResizeObserver | null = null;
    let tries = 0;
    let frame = 0;

    const applySize = (api: IChartApi) => {
      const { width, height } = paneSize(el);
      api.applyOptions({ width, height });
    };

    const mount = () => {
      if (cancelled) return;
      const { width, height } = paneSize(el);
      if ((width < 2 || height < 2) && tries < 30) {
        tries += 1;
        frame = requestAnimationFrame(mount);
        return;
      }

      const api = createChart(el, {
        width,
        height,
        autoSize: false,
        layout: {
          background: { type: ColorType.Solid, color: CHART_BG },
          textColor: "#9bb0c2",
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
        },
        grid: {
          vertLines: { color: "rgba(155,176,194,0.08)" },
          horzLines: { color: "rgba(155,176,194,0.08)" },
        },
        rightPriceScale: {
          borderColor: "rgba(155,176,194,0.16)",
          autoScale: true,
          scaleMargins: { top: 0.08, bottom: 0.08 },
        },
        timeScale: {
          borderColor: "rgba(155,176,194,0.16)",
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: CrosshairMode.Magnet,
          vertLine: {
            color: "rgba(45,212,191,0.35)",
            labelBackgroundColor: "#1a3344",
          },
          horzLine: {
            color: "rgba(45,212,191,0.25)",
            labelBackgroundColor: "#1a3344",
          },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: false,
        },
        handleScale: { mouseWheel: true, pinch: true },
      });

      const ventaData: LineData<Time>[] = mepQuotedField(mapped, "venta").map(
        (p) => ({
          time: p.t,
          value: p.venta,
        }),
      );
      const compraData: LineData<Time>[] = mepQuotedField(mapped, "compra").map(
        (p) => ({
          time: p.t,
          value: p.compra,
        }),
      );
      const priceRange = mepPriceScaleRange(mapped);
      const autoscaleInfo = priceRange
        ? () => ({
            priceRange: {
              minValue: priceRange.from,
              maxValue: priceRange.to,
            },
          })
        : undefined;

      const venta = api.addSeries(LineSeries, {
        color: VENTA,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: true,
        autoscaleInfoProvider: autoscaleInfo,
      });
      const compra = api.addSeries(LineSeries, {
        color: COMPRA,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: true,
        autoscaleInfoProvider: autoscaleInfo,
      });
      venta.setData(ventaData);
      compra.setData(compraData);
      api.timeScale().fitContent();

      const byTime = new Map(mapped.map((p) => [p.t, p]));
      api.subscribeCrosshairMove((param) => {
        if (!param.time) {
          setHover(null);
          return;
        }
        const point = byTime.get(param.time as UTCTimestamp);
        if (!point) {
          setHover(null);
          return;
        }
        setHover({
          time: point.datetime,
          venta: point.venta,
          compra: point.compra,
        });
      });

      chart = api;
      chartRef.current = api;
      ventaRef.current = venta;
      compraRef.current = compra;

      applySize(api);
      resize = new ResizeObserver(() => applySize(api));
      resize.observe(el);
    };

    frame = requestAnimationFrame(mount);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resize?.disconnect();
      chart?.remove();
      chartRef.current = null;
      ventaRef.current = null;
      compraRef.current = null;
    };
    // points identity is enough; mapped is derived
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const shown = hover ?? (last
    ? { time: last.datetime, venta: last.venta, compra: last.compra }
    : null);

  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl bg-[var(--chart-bg)] ring-1 ring-white/10">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-2 sm:gap-4 sm:px-5 sm:pt-5 sm:pb-3">
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.16em] text-white/45 uppercase">
            {labels.title}
          </p>
          {shown ? (
            <p className="mt-1 font-mono text-xs text-white/55">
              {formatClock(shown.time)}
            </p>
          ) : null}
        </div>
        <div className="flex gap-5 text-sm sm:gap-6">
          <div>
            <p className="text-[11px] text-white/45">{labels.sell}</p>
            <p className="font-mono text-base text-[#2dd4bf] tabular-nums sm:text-lg">
              {shown && isQuotedPrice(shown.venta)
                ? formatMepAmount(shown.venta)
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/45">{labels.buy}</p>
            <p className="font-mono text-base text-[#f4c38b] tabular-nums sm:text-lg">
              {shown && isQuotedPrice(shown.compra)
                ? formatMepAmount(shown.compra)
                : "—"}
            </p>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="chart-pane h-[280px] w-full min-w-0 sm:h-[340px] lg:h-[440px]"
      />
    </div>
  );
}
