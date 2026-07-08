import type { ReactNode } from 'react';

interface CanvasFrameProps {
  topBar?: ReactNode;
  children: ReactNode;
}

/**
 * The canvas region's outer shell: dark stage + fixed-height toolbar row +
 * dotted work surface. Used identically before and after upload — only the
 * toolBar and children change, so there is never a layout jump when an
 * image lands.
 */
export function CanvasFrame({ topBar, children }: CanvasFrameProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[#111113] dark:bg-[#0A0A0C]">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/5 px-4">
        {topBar ?? null}
      </div>
      <div className="canvas-grid relative flex flex-1 min-h-0 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
