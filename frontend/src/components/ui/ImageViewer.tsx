import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.25;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 6.5h4M6.5 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 6.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FullscreenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RotateCCWIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M3 8a5 5 0 1 0 1.5-3.5L2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RotateCWIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M13 8a5 5 0 1 1-1.5-3.5L14 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v3h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // degrees: 0 | 90 | 180 | 270
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setImgLoaded(false);
    setImgError(false);
  }, [src]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const rotateCW = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
    setPan({ x: 0, y: 0 });
  }, []);

  const rotateCCW = useCallback(() => {
    setRotation((r) => (r - 90 + 360) % 360);
    setPan({ x: 0, y: 0 });
  }, []);

  const clampedPan = useCallback(
    (nextZoom: number, nextPan: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container) return nextPan;
      const { width, height } = container.getBoundingClientRect();
      // Allow free panning always; just keep bounds generous so image stays reachable
      const maxX = Math.max(((nextZoom - 1) * width) / 2, width * 0.4);
      const maxY = Math.max(((nextZoom - 1) * height) / 2, height * 0.4);
      return {
        x: clamp(nextPan.x, -maxX, maxX),
        y: clamp(nextPan.y, -maxY, maxY),
      };
    },
    [],
  );

  const zoomBy = useCallback(
    (delta: number) => {
      setZoom((prev) => {
        const next = clamp(prev + delta, MIN_ZOOM, MAX_ZOOM);
        if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
        else setPan((p) => clampedPan(next, p));
        return next;
      });
    },
    [clampedPan],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      zoomBy(delta);
    },
    [zoomBy],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return; // nothing to reveal by panning an already-fit image
    setIsDragging(true);
    lastPointer.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !lastPointer.current) return;
    const dx = event.clientX - lastPointer.current.x;
    const dy = event.clientY - lastPointer.current.y;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setPan((prev) => clampedPan(zoom, { x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    lastPointer.current = null;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleKey = (event: KeyboardEvent) => {
      if (document.activeElement !== container) return;
      switch (event.key) {
        case '+': case '=': event.preventDefault(); zoomBy(ZOOM_STEP); break;
        case '-': event.preventDefault(); zoomBy(-ZOOM_STEP); break;
        case '0': event.preventDefault(); resetView(); break;
        case 'ArrowLeft': event.preventDefault(); setPan((p) => clampedPan(zoom, { x: p.x + 20, y: p.y })); break;
        case 'ArrowRight': event.preventDefault(); setPan((p) => clampedPan(zoom, { x: p.x - 20, y: p.y })); break;
        case 'ArrowUp': event.preventDefault(); setPan((p) => clampedPan(zoom, { x: p.x, y: p.y + 20 })); break;
        case 'ArrowDown': event.preventDefault(); setPan((p) => clampedPan(zoom, { x: p.x, y: p.y - 20 })); break;
      }
    };
    container.addEventListener('keydown', handleKey);
    return () => container.removeEventListener('keydown', handleKey);
  }, [zoom, zoomBy, resetView, clampedPan]);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label={`Image viewer: ${alt}. Scroll to zoom, drag to pan, + / - to zoom, 0 to reset.`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={[
        'relative flex items-center justify-center overflow-hidden rounded-lg',
        isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-default',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-black' : '',
        className ?? '',
      ].join(' ')}
      style={isFullscreen ? undefined : undefined}
    >
      {/* Loading skeleton */}
      {!imgLoaded && !imgError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {imgError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white/20" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          </svg>
          <p className="text-xs text-white/30">Failed to load image</p>
        </div>
      )}

      {/* Image */}
<img
  src={src}
  alt={alt}
  draggable={false}
  onLoad={() => setImgLoaded(true)}
  onError={() => setImgError(true)}
  style={{
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    userSelect: 'none',
    touchAction: 'none',
    opacity: imgLoaded ? 1 : 0,
    transition: isDragging
      ? 'none'
      : 'transform 0.15s ease-out, opacity 0.3s ease',
    maxWidth: '100%',
    maxHeight: '100%',
  }}
  className="block object-contain rounded-md shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)]"
/>

      {/* Zoom & view controls — a persistent toolbar, not a hover-only pill.
          Anchored to the canvas viewport (the pro-app convention), always
          visible, every button the same height so nothing looks misaligned. */}
      <div
        className="absolute bottom-4 left-1/2 flex h-11 -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/70 px-1.5 shadow-lg backdrop-blur-sm"
        aria-label="Image viewer controls"
      >
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_STEP)}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-25 transition-colors"
        >
          <ZoomOutIcon className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={resetView}
          disabled={zoom === MIN_ZOOM}
          className="flex h-8 min-w-[3.25rem] shrink-0 items-center justify-center rounded-full font-mono text-[12px] text-white/60 hover:text-white hover:bg-white/10 disabled:cursor-default disabled:hover:text-white/60 disabled:hover:bg-transparent transition-colors"
          aria-label="Reset zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() => zoomBy(ZOOM_STEP)}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-25 transition-colors"
        >
          <ZoomInIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="mx-1 h-4 w-px shrink-0 bg-white/10" />

        <button
          type="button"
          onClick={rotateCCW}
          aria-label="Rotate counter-clockwise"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RotateCCWIcon className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={rotateCW}
          aria-label="Rotate clockwise"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RotateCWIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="mx-1 h-4 w-px shrink-0 bg-white/10" />

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          aria-pressed={isFullscreen}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <FullscreenIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
