"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cog, Mail, Maximize2, Minus, Plus, User } from "lucide-react";
import {
  localizeOnboardingBpmn,
  type BpmnLabelCopy,
} from "@/lib/bpmn-labels";
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
  diagramCopy,
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
  diagramCopy: BpmnLabelCopy;
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

    async function mount(container: HTMLElement) {
      try {
        const size = await waitForHostSize(container, () => cancelled);
        if (cancelled || !size) return;

        const [xmlRes, Viewer] = await Promise.all([
          fetch(BPMN_HREF),
          loadViewerCtor(),
        ]);
        if (cancelled) return;
        if (!xmlRes.ok) throw new Error("bpmn fetch failed");
        const xml = localizeOnboardingBpmn(await xmlRes.text(), diagramCopy);
        if (cancelled) return;

        const ready = measureHost(container) ?? size;

        instance = new Viewer({
          container,
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
        syncCanvas(container, canvas, "open");
        await nextFrame();
        if (cancelled) return;
        syncCanvas(container, canvas, "open");
        settle = window.setTimeout(() => {
          if (cancelled) return;
          syncCanvas(container, canvas, "open");
        }, 80);

        resize = new ResizeObserver(() => {
          if (cancelled) return;
          syncCanvas(container, canvas, "keep");
        });
        resize.observe(container);
        if (container.parentElement) resize.observe(container.parentElement);
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

    void mount(host);

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
  }, [diagramCopy.pool, diagramCopy.yes]);

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
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="bpmn-legend mb-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] tracking-wider text-muted-foreground uppercase">
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
            className="size-2 bg-primary/80 [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]"
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
        <div className="flex shrink-0 items-center gap-1">
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
              try {
                canvasRef.current?.resized();
              } catch {
                // Safari SVGMatrix
              }
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
  if (width < 80 || height < 80) return null;
  return { width, height };
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

function syncCanvas(
  host: HTMLElement,
  canvas: Canvas,
  mode: "open" | "keep",
) {
  const previous = mode === "keep" ? readViewport(host) : null;
  pinSvgSize(host);
  try {
    canvas.resized();
  } catch {
    // Safari can reject a non-finite SVGMatrix.
  }
  if (previous) {
    setViewportTransform(host, previous.x, previous.y, previous.scale);
    return;
  }
  applyOpeningView(host);
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
  const matrix = `matrix(${scale},0,0,${scale},${tx},${ty})`;
  viewport.setAttribute("transform", matrix);
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
  host.style.width = `${size.width}px`;
  host.style.height = `${size.height}px`;
  host.querySelectorAll<HTMLElement>(".djs-container, .djs-parent").forEach((el) => {
    el.style.width = `${size.width}px`;
    el.style.height = `${size.height}px`;
    el.style.maxWidth = `${size.width}px`;
    el.style.maxHeight = `${size.height}px`;
  });
  const svg = host.querySelector("svg");
  if (!svg) return;
  svg.setAttribute("width", String(size.width));
  svg.setAttribute("height", String(size.height));
  svg.setAttribute("preserveAspectRatio", "none");
  svg.style.width = `${size.width}px`;
  svg.style.height = `${size.height}px`;
  svg.style.maxWidth = `${size.width}px`;
  svg.style.maxHeight = `${size.height}px`;
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
