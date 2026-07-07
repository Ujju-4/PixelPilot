interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label
      className={[
        'group flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition-all duration-150',
        checked
          ? 'border-accent/30 bg-accent-subtle dark:border-accent/25 dark:bg-accent-subtle-dark'
          : 'border-border/60 bg-surface hover:border-border hover:bg-canvas dark:border-border-dark/50 dark:bg-surface-dark dark:hover:border-border-dark dark:hover:bg-canvas-dark',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        aria-hidden="true"
        className={[
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-all duration-150',
          checked
            ? 'border-accent bg-accent'
            : 'border-border bg-surface group-hover:border-ink-tertiary dark:border-border-dark dark:bg-surface-dark dark:group-hover:border-ink-dark-tertiary',
        ].join(' ')}
      >
        {checked && (
          <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-ink dark:text-ink-dark">
          {label}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-ink-secondary dark:text-ink-dark-secondary">
          {description}
        </span>
      </span>
    </label>
  );
}
