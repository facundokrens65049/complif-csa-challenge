"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cog, Mail, Maximize2, Minus, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BPMN_HREF = "/cliente-adquisition.bpmn";

/** Top-left crop that covers "Caso cerrado" plus the first happy-path lane. */
const OPEN_X = 80;
const OPEN_Y = 20;
const OPEN_H = 540;

type Viewbox = {
  x: number;
  y: number;
  width: number;
  height: number;
  inner: { width: number; height: number };
  outer: { width: number; height: number };
};

type Canvas = {
  resized: () => void;
  zoom: (level?: number | "fit-viewport", center?: "auto") => number;
  viewbox: (box?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => Viewbox;
};

type BpmnViewerInstance = {
  destroy: () => void;
  importXML: (xml: string) => Promise<unknown>;
  get: (name: "canvas") => Canvas;
};

export function BpmnViewer({
  hint,
  zoomInLabel,
  zoomOutLabel,
  fitLabel,
  errorLabel,
  legend,
}: {
  hint: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  fitLabel: string;
  errorLabel: string;
  legend: {
    start: string;
    user: string;
    service: string;
    send: string;
    gateway: string;
    end: string;
  };
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let instance: BpmnViewerInstance | undefined;
    let imported = false;
    let resize: ResizeObserver | undefined;
    let settle: number | undefined;

    async function mount() {
      try {
        const size = await waitForHostSize(host, () => cancelled);
        if (cancelled || !host || !size) return;

        const [xmlRes, Viewer] = await Promise.all([
          fetch(BPMN_HREF),
          loadViewerCtor(),
        ]);
        if (cancelled || !host) return;
        if (!xmlRes.ok) throw new Error("bpmn fetch failed");
        const xml = await xmlRes.text();
        if (cancelled) return;

        const ready = measureHost(host) ?? size;

        instance = new Viewer({
          container: host,
          width: ready.width,
          height: ready.height,
        });

        await instance.importXML(xml);
        imported = true;
        if (cancelled) {
          instance.destroy();
          instance = undefined;
          return;
        }

        const canvas = instance.get("canvas");
        canvasRef.current = canvas;
        await nextFrame();
        if (cancelled) return;
        pinSvgSize(host);
        applyOpeningView(host);
        await nextFrame();
        if (cancelled) return;
        pinSvgSize(host);
        applyOpeningView(host);
        settle = window.setTimeout(() => {
          if (cancelled) return;
          pinSvgSize(host);
          applyOpeningView(host);
        }, 80);

        resize = new ResizeObserver(() => {
          if (cancelled) return;
          pinSvgSize(host);
          try {
            canvas.resized();
          } catch {
            // Ignore layout glitches while the SVG is settling.
          }
        });
        resize.observe(host);
        if (host.parentElement) resize.observe(host.parentElement);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(true);
        try {
          instance?.destroy();
        } catch {
          // Ignore a second destroy after a failed import.
        }
        instance = undefined;
      }
    }

    void mount();

    return () => {
      cancelled = true;
      if (settle) window.clearTimeout(settle);
      resize?.disconnect();
      canvasRef.current = null;
      // Destroying during importXML makes bpmn-js throw Incoming: [].
      if (imported) {
        try {
          instance?.destroy();
        } catch {
          // Ignore teardown errors.
        }
      }
    };
  }, []);

  function zoomBy(delta: number) {
    const host = hostRef.current;
    if (!host) return;
    const current = readViewport(host);
    if (current) {
      setViewportTransform(
        host,
        current.x,
        current.y,
        Math.min(2.4, Math.max(0.15, current.scale + delta)),
      );
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const zoom = canvas.zoom();
      if (!Number.isFinite(zoom)) return;
      canvas.zoom(Math.min(2.4, Math.max(0.15, zoom + delta)));
    } catch {
      applyOpeningView(host);
    }
  }

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-wider text-muted-foreground uppercase">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-primary" />
          {legend.start}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <User className="size-3 text-primary" strokeWidth={1.75} />
          {legend.user}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Mail className="size-3 text-primary" strokeWidth={1.75} />
          {legend.send}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Cog className="size-3 text-primary" strokeWidth={1.75} />
          {legend.service}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2 bg-primary/80"
            style={{ transform: "rotate(45deg)" }}
          />
          {legend.gateway}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full border-2 border-foreground/70" />
          {legend.end}
        </span>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-sm text-muted-foreground">{hint}</p>
        <div className="print-chrome flex shrink-0 items-center gap-1">
          <ZoomButton label={zoomOutLabel} onClick={() => zoomBy(-0.15)}>
            <Minus className="size-4" strokeWidth={1.75} />
          </ZoomButton>
          <ZoomButton
            label={fitLabel}
            onClick={() => {
              const host = hostRef.current;
              if (!host) return;
              pinSvgSize(host);
              applyOpeningView(host);
            }}
          >
            <Maximize2 className="size-4" strokeWidth={1.75} />
          </ZoomButton>
          <ZoomButton label={zoomInLabel} onClick={() => zoomBy(0.15)}>
            <Plus className="size-4" strokeWidth={1.75} />
          </ZoomButton>
        </div>
      </div>
      <div className="bpmn-frame ring-1 ring-foreground/10">
        <div ref={hostRef} className="bpmn-canvas" />
        {error ? (
          <p className="absolute inset-0 flex items-center justify-center bg-card px-4 text-center text-sm text-muted-foreground">
            {errorLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type ViewerCtor = new (options: {
  container: HTMLElement;
  width: number;
  height: number;
}) => BpmnViewerInstance;

async function loadViewerCtor(): Promise<ViewerCtor> {
  const { default: NavigatedViewer } = await import(
    "bpmn-js/lib/NavigatedViewer"
  );
  return NavigatedViewer as unknown as ViewerCtor;
}

function measureHost(host: HTMLElement): { width: number; height: number } | null {
  const frame = host.parentElement;
  const frameRect = frame?.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const width = Math.round(frameRect?.width || hostRect.width || host.clientWidth || 0);
  const height = Math.round(
    frameRect?.height || hostRect.height || host.clientHeight || 0,
  );
  if (width < 160 || height < 160) return null;
  return {
    width: Math.max(320, width),
    height: Math.max(220, height),
  };
}

async function waitForHostSize(
  host: HTMLElement,
  isCancelled: () => boolean,
): Promise<{ width: number; height: number } | null> {
  for (let i = 0; i < 16; i++) {
    if (isCancelled()) return null;
    const size = measureHost(host);
    if (size) return size;
    await nextFrame();
  }
  return (
    measureHost(host) ?? {
      width: 640,
      height: 420,
    }
  );
}

function applyOpeningView(host: HTMLElement) {
  const size = measureHost(host);
  if (!size) return;
  const scale = size.height / OPEN_H;
  if (!Number.isFinite(scale) || scale <= 0) return;
  setViewportTransform(host, OPEN_X, OPEN_Y, scale);
}

function setViewportTransform(
  host: HTMLElement,
  x: number,
  y: number,
  scale: number,
) {
  const viewport = host.querySelector("g.viewport");
  if (!viewport) return;
  const tx = -x * scale;
  const ty = -y * scale;
  viewport.setAttribute(
    "transform",
    `matrix(${scale},0,0,${scale},${tx},${ty})`,
  );
}

function readViewport(
  host: HTMLElement,
): { x: number; y: number; scale: number } | null {
  const viewport = host.querySelector("g.viewport");
  const raw = viewport?.getAttribute("transform");
  if (!raw) return null;
  const match = raw.match(
    /matrix\(\s*([^,\s]+)[,\s]+([^,\s]+)[,\s]+([^,\s]+)[,\s]+([^,\s]+)[,\s]+([^,\s]+)[,\s]+([^,\s)]+)/,
  );
  if (!match) return null;
  const scale = Number(match[1]);
  const tx = Number(match[5]);
  const ty = Number(match[6]);
  if (![scale, tx, ty].every(Number.isFinite) || scale === 0) return null;
  return { scale, x: -tx / scale, y: -ty / scale };
}

function pinSvgSize(host: HTMLElement) {
  const size = measureHost(host);
  if (!size) return;
  const svg = host.querySelector("svg");
  if (!svg) return;
  svg.setAttribute("width", String(size.width));
  svg.setAttribute("height", String(size.height));
  svg.style.width = `${size.width}px`;
  svg.style.height = `${size.height}px`;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full text-muted-foreground",
        "transition-colors hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
