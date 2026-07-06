import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide text-ink-secondary dark:text-ink-dark-secondary">
          {label}
        </span>
      )}
      <input
        className={[
          'h-9 w-full rounded-xl border border-border/60 dark:border-border-dark/60',
          'bg-canvas dark:bg-canvas-dark px-3 text-sm',
          'placeholder:text-ink-secondary/50 dark:placeholder:text-ink-dark-secondary/50',
          'transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          className,
        ].join(' ')}
        {...rest}
      />
      {hint && (
        <span className="text-xs text-ink-secondary dark:text-ink-dark-secondary">{hint}</span>
      )}
    </div>
  );
}
