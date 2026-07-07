import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          {label}
        </span>
      )}
      <input
        className={[
          'h-9 w-full rounded-lg border border-border/60 dark:border-border-dark/50',
          'bg-canvas dark:bg-canvas-dark px-3 text-[13px] text-ink dark:text-ink-dark',
          'placeholder:text-ink-secondary/40 dark:placeholder:text-ink-dark-secondary/40',
          'transition-colors hover:border-border dark:hover:border-border-dark focus:border-accent focus:outline-none',
          className,
        ].join(' ')}
        {...rest}
      />
      {hint && (
        <span className="text-[11px] text-ink-secondary dark:text-ink-dark-secondary">{hint}</span>
      )}
    </div>
  );
}
