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

function ZoomIcon({ className }: { className?: string }) {
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
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Clamp pan so image doesn't drift off screen.
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

  // Wheel zoom.
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const delta = event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      zoomBy(delta);
    },
    [zoomBy],
  );

  // Pointer pan.
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

  // Keyboard controls.
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

  // Fullscreen API.
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
      aria-label={`Image viewer: ${alt}. Scroll to zoom, drag to pan, + / - to zoom, 0 to reset, F for fullscreen.`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={[
        'group relative overflow-hidden rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark',
        isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in',
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : '',
        className ?? '',
      ].join(' ')}
    >
      {/* Image */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          userSelect: 'none',
          touchAction: 'none',
        }}
        className="block w-full h-full object-contain"
      />

      {/* Toolbar — visible on hover or focus */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-border dark:border-border-dark bg-surface/90 dark:bg-surface-dark/90 px-2 py-1 shadow-soft backdrop-blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
          aria-label="Image viewer controls"
        >
          <button
            type="button"
            onClick={() => zoomBy(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="rounded-sm p-1 text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark disabled:opacity-30 transition-colors"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={resetView}
            className="min-w-[3rem] rounded-sm px-1 py-0.5 font-mono text-xs text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
            aria-label="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={() => zoomBy(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="rounded-sm p-1 text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark disabled:opacity-30 transition-colors"
          >
            <ZoomIcon className="h-4 w-4" />
          </button>

          <div className="mx-1 h-4 w-px bg-border dark:bg-border-dark" />

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            aria-pressed={isFullscreen}
            className="rounded-sm p-1 text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark transition-colors"
          >
            <FullscreenIcon className="h-4 w-4" />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Zoom level badge when zoomed in */}
      {zoom > 1 && (
        <div className="absolute top-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 font-mono text-xs text-white pointer-events-none">
          {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}
