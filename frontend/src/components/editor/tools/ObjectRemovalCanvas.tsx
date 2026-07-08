import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { getImageFileUrl } from '@/services/imagesService';
import { useObjectRemoval } from '@/contexts/ObjectRemovalContext';

const BRUSH_RADIUS = 22;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

interface ObjectRemovalCanvasProps {
  imageId: string;
}

export function ObjectRemovalCanvas({ imageId }: ObjectRemovalCanvasProps) {
  const imageUrl = getImageFileUrl(imageId);
  const { maskCanvasRef, setHasPaint, clearTrigger } = useObjectRemoval();

  // The overlay canvas sits on top of the <img> — transparent bg, red strokes only
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  // A ref, not state: the paint handler must see the *current* painting
  // status synchronously on pointerdown, in the same tick it starts. State
  // updates land on the next render, so the very first dot of every stroke
  // was being silently dropped (paint() still saw the stale `false`).
  const isPaintingRef = useRef(false);
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  // The size the image renders at when zoom === 1 (i.e. constrained by the
  // max-h/max-w classes). Captured once on load so zoom has a stable base to
  // scale from — this is what lets us resize with real width/height instead
  // of a CSS transform.
  const [baseSize, setBaseSize] = useState<{ w: number; h: number } | null>(null);

  const clampZoom = useCallback((z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)), []);
  const zoomIn = useCallback(() => setZoom((z) => clampZoom(+(z + ZOOM_STEP).toFixed(2))), [clampZoom]);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(+(z - ZOOM_STEP).toFixed(2))), [clampZoom]);
  const resetZoom = useCallback(() => setZoom(1), []);

  // Ctrl/Cmd + wheel to zoom
  const handleWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(+(z - e.deltaY * 0.0015).toFixed(2)));
    },
    [clampZoom],
  );

  // Once the <img> loads, record natural + rendered dimensions and size the canvases
  const handleImgLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setDimensions({ w, h });

    // Overlay canvas (transparent — just red strokes)
    const overlay = overlayCanvasRef.current;
    if (overlay) {
      overlay.width = w;
      overlay.height = h;
    }

    // Mask canvas (white strokes on black — sent to API)
    const mask = maskCanvasRef.current;
    if (mask) {
      mask.width = w;
      mask.height = h;
    }

    // Capture the as-rendered (zoom 1) box size, before we ever touch zoom
    const rect = img.getBoundingClientRect();
    setBaseSize({ w: rect.width, h: rect.height });

    setImgLoaded(true);
  }, [maskCanvasRef]);

  // Clear everything when the panel triggers a clear
  useEffect(() => {
    if (clearTrigger === 0) return;
    const overlay = overlayCanvasRef.current;
    const mask = maskCanvasRef.current;
    if (!overlay || !mask || !dimensions) return;
    overlay.getContext('2d')?.clearRect(0, 0, dimensions.w, dimensions.h);
    mask.getContext('2d')?.clearRect(0, 0, dimensions.w, dimensions.h);
  }, [clearTrigger, maskCanvasRef, dimensions]);

  const getPoint = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      const canvas = overlayCanvasRef.current;
      if (!canvas || !dimensions) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (dimensions.w / rect.width),
        y: (e.clientY - rect.top) * (dimensions.h / rect.height),
      };
    },
    [dimensions],
  );

  const paint = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (!isPaintingRef.current) return;
      const pt = getPoint(e);
      if (!pt) return;

      // Vivid violet stroke on overlay (what the user sees) — high-opacity so
      // it's unmistakably visible even on dark or red-toned images.
      const overlayCtx = overlayCanvasRef.current?.getContext('2d');
      if (overlayCtx) {
        overlayCtx.fillStyle = 'rgba(37, 99, 235, 0.82)'; // accent #2563EB at 82 %
        overlayCtx.beginPath();
        overlayCtx.arc(pt.x, pt.y, BRUSH_RADIUS, 0, Math.PI * 2);
        overlayCtx.fill();
        // Crisp white ring — makes the brush edge legible on any background colour
        overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        overlayCtx.lineWidth = 2;
        overlayCtx.stroke();
      }

      // White stroke on mask (what the API gets)
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (maskCtx) {
        maskCtx.fillStyle = '#ffffff';
        maskCtx.beginPath();
        maskCtx.arc(pt.x, pt.y, BRUSH_RADIUS, 0, Math.PI * 2);
        maskCtx.fill();
      }

      setHasPaint(true);
    },
    [getPoint, maskCanvasRef, setHasPaint],
  );

  // Real pixel size for the current zoom — undefined at zoom 1 so the
  // original max-h/max-w classes keep driving layout untouched.
  const zoomedStyle =
    zoom !== 1 && baseSize
      ? { width: baseSize.w * zoom, height: baseSize.h * zoom, maxWidth: 'none', maxHeight: 'none' }
      : undefined;

  return (
    // overflow-hidden here is what guarantees the zoom pill (and anything
    // else absolutely positioned against this box) can never render outside
    // the visible canvas frame, regardless of how the scrollable content
    // inside sizes itself.
    <div className="relative w-full h-full overflow-hidden">
      {/* Hidden mask canvas */}
      <canvas ref={maskCanvasRef as React.RefObject<HTMLCanvasElement>} className="hidden" />

      {/* Spinner while image loads */}
      {!imgLoaded && (
        <div className="flex h-full w-full items-center justify-center gap-3 text-ink-secondary/50 dark:text-white/40">
          <div className="h-6 w-6 rounded-full border-2 border-black/10 border-t-black/30 dark:border-white/10 dark:border-t-white/50 animate-spin" />
          <span className="text-sm">Loading image…</span>
        </div>
      )}

      {/* Scrollable viewport — lets the user pan around once zoomed in */}
      <div
        onWheel={handleWheel}
        className={[
          'absolute inset-0 overflow-auto',
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : '',
          imgLoaded ? 'flex' : 'hidden',
        ].join(' ')}
        style={{ padding: zoom > 1 ? 24 : 0 }}
      >
        <div className="flex min-h-full w-full items-center justify-center">
          {/* Image + overlay canvas stacked */}
          <div
            className="relative overflow-hidden rounded-lg shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]"
            style={zoomedStyle}
          >
            {/* The actual image — no crossOrigin needed, no CORS issue */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Remove object target"
              className="block max-h-[calc(100vh-200px)] max-w-full select-none"
              style={zoomedStyle}
              draggable={false}
              onLoad={handleImgLoad}
            />

            {/* Transparent canvas overlay — receives pointer events, draws red paint */}
            {imgLoaded && (
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                onPointerDown={(e) => {
                  isPaintingRef.current = true;
                  paint(e);
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                }}
                onPointerMove={paint}
                onPointerUp={() => { isPaintingRef.current = false; }}
                onPointerLeave={() => { isPaintingRef.current = false; }}
              />
            )}

            {/* Bottom hint */}
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-3 py-1 text-[11px] text-white/60 backdrop-blur-sm">
              Paint over the object, then click Remove object →
            </div>
          </div>
        </div>
      </div>

      {/* Zoom controls — pinned to the true frame corner, always contained */}
      {imgLoaded && (
        <div className="absolute bottom-3 right-3 z-10 flex h-10 items-center gap-1 rounded-lg bg-black/70 p-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5"><path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          <button
            type="button"
            onClick={resetZoom}
            aria-label="Reset zoom"
            className="min-w-[44px] rounded-md px-2 text-center text-[12px] font-medium tabular-nums text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="flex h-8 w-8 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <svg viewBox="0 0 12 12" fill="none" className="h-3.5 w-3.5"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
