import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

// Underline field, not a boxed rectangle — reads as "editable text" and is
// visually distinct from buttons (filled/outlined) and segmented controls
// (a track), per the component-differentiation requirement.
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
          'h-8 w-full border-0 border-b bg-transparent px-0 text-[13px] text-ink dark:text-ink-dark',
          'border-border dark:border-border-dark',
          'placeholder:text-ink-secondary/40 dark:placeholder:text-ink-dark-secondary/40',
          'transition-colors hover:border-ink-tertiary dark:hover:border-ink-dark-tertiary',
          'focus:border-accent focus:outline-none',
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
