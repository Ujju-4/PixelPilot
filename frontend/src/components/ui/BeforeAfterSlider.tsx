import { useCallback, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = (e: MouseEvent) => {
    dragging.current = true;
    updatePosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  };

  const handleMouseUp = () => { dragging.current = false; };

  const handleTouchStart = (e: TouchEvent) => {
    dragging.current = true;
    updatePosition(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      aria-label="Before/After comparison. Drag to compare."
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 5));
        if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 5));
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="relative w-full cursor-col-resize overflow-hidden rounded-lg border border-white/10 select-none touch-none"
    >
      {/* After image (bottom layer, full width) */}
      <img
        src={afterUrl}
        alt="After"
        draggable={false}
        className="block w-full"
      />

      {/* Before image (clipped to the left portion) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeUrl}
          alt="Before"
          draggable={false}
          className="block w-full h-full object-cover"
        />
      </div>

      {/* Divider line */}
      <motion.div
        className="absolute inset-y-0 w-0.5 bg-white shadow-soft pointer-events-none"
        style={{ left: `${position}%` }}
      >
        {/* Handle knob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 border-white bg-ink dark:bg-ink-dark shadow-soft flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-white">
            <path d="M4 8H12M4 8l2-2M4 8l2 2M12 8l-2-2M12 8l-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>

      {/* Labels */}
      <span className="absolute left-2 top-2 rounded-sm bg-ink/70 px-1.5 py-0.5 text-xs font-medium text-white pointer-events-none">
        {beforeLabel}
      </span>
      <span className="absolute right-2 top-2 rounded-sm bg-ink/70 px-1.5 py-0.5 text-xs font-medium text-white pointer-events-none">
        {afterLabel}
      </span>
    </div>
  );
}
