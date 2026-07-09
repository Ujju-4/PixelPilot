import type { ReactNode } from 'react';

interface CanvasFrameProps {
  topBar?: ReactNode;
  children: ReactNode;
}

/**
 * The canvas region's outer shell — adapts to the active colour scheme.
 * Light mode: cool neutral-gray workspace (#E9EAED, dark dot-grid).
 * Dark mode:  near-black stage (#0A0A0C, white dot-grid).
 * Used identically before and after upload so there is no layout jump.
 */
export function CanvasFrame({ topBar, children }: CanvasFrameProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-stage dark:bg-stage-dark">
      {/* Toolbar row — separator uses ink opacity so it's visible on both themes */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-black/[0.07] dark:border-white/[0.05] px-4">
        {topBar ?? null}
      </div>
      {/* Work surface — canvas-grid class now adapts dot colour per theme (see globals.css) */}
      <div className="canvas-grid relative flex flex-1 min-h-0 items-center justify-center p-2">
        {children}
      </div>
    </div>
  );
}
