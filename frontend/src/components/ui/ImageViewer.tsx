import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.3;

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

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  // Reset state when src changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImgLoaded(false);
    setImgError(false);
  }, [src]);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const clampedPan = useCallback(
    (nextZoom: number, nextPan: { x: number; y: number }) => {
      const container = containerRef.current;
      if (!container) return nextPan;
      const { width, height } = container.getBoundingClientRect();
      const maxX = ((nextZoom - 1) * width) / 2;
      const maxY = ((nextZoom - 1) * height) / 2;
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
    if (zoom <= 1) return;
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
        'group relative flex items-center justify-center overflow-hidden rounded-lg',
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
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
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

      {/* Controls overlay — on hover */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full border border-white/10 bg-black/60 px-2 py-1 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200"
          aria-label="Image viewer controls"
        >
          <button
            type="button"
            onClick={() => zoomBy(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="rounded-full p-1 text-white/50 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ZoomOutIcon className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={resetView}
            className="min-w-[2.8rem] rounded-full px-1 py-0.5 font-mono text-[10px] text-white/50 hover:text-white transition-colors"
            aria-label="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => zoomBy(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="rounded-full p-1 text-white/50 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ZoomInIcon className="h-3.5 w-3.5" />
          </button>

          <div className="mx-1 h-3 w-px bg-white/10" />

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            aria-pressed={isFullscreen}
            className="rounded-full p-1 text-white/50 hover:text-white transition-colors"
          >
            <FullscreenIcon className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Zoom level badge */}
      {zoom > 1 && (
        <div className="absolute top-3 right-3 rounded-full bg-black/60 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/60 pointer-events-none backdrop-blur-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}
