import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className = '', children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-ink-secondary dark:text-ink-dark-secondary">
          {label}
        </span>
      )}
      <select
        className={[
          'h-9 w-full appearance-none rounded-xl border border-border/60 dark:border-border-dark/60',
          'bg-canvas dark:bg-canvas-dark px-3 pr-8 text-sm',
          'transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M2 4l4 4 4-4\' stroke=\'%2371717A\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E")] bg-[right_12px_center] bg-no-repeat',
          className,
        ].join(' ')}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
