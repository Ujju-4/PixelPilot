import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="pointer-events-none h-3 w-3 shrink-0">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Select({ label, className = '', children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          {label}
        </span>
      )}
      <div className="relative flex items-center">
        <select
          className={[
            'h-9 w-full appearance-none rounded-md border border-border/70 dark:border-border-dark/60',
            'bg-black/[0.04] dark:bg-white/[0.05] px-2.5 pr-8 text-[13px] text-ink dark:text-ink-dark',
            'transition-colors hover:border-border dark:hover:border-border-dark focus:border-accent focus:outline-none',
            className,
          ].join(' ')}
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-2.5 text-ink-tertiary dark:text-ink-dark-tertiary">
          <ChevronDown />
        </span>
      </div>
    </div>
  );
}
