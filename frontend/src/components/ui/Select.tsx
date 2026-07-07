import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          {label}
        </span>
      )}
      <select
        className={[
          'h-9 w-full appearance-none rounded-lg border border-border/60 dark:border-border-dark/50',
          'bg-canvas dark:bg-canvas-dark px-3 pr-8 text-[13px] text-ink dark:text-ink-dark',
          'transition-colors hover:border-border dark:hover:border-border-dark focus:border-accent focus:outline-none',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M2 4l4 4 4-4\' stroke=\'%2371717A\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")] bg-[right_12px_center] bg-no-repeat',
          className,
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
