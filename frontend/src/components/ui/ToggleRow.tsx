interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className={[
      'flex cursor-pointer items-start gap-2.5 rounded border px-2.5 py-2 transition-all duration-150',
      checked
        ? 'border-accent/25 dark:border-accent/20 bg-accent-subtle dark:bg-accent-subtle-dark'
        : 'border-border/40 dark:border-border-dark/40 hover:border-border dark:hover:border-border-dark bg-canvas dark:bg-canvas-dark',
    ].join(' ')}>
      <div className="mt-0.5 relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={[
          'h-3.5 w-3.5 rounded-sm flex items-center justify-center transition-all duration-150 border',
          checked
            ? 'bg-accent border-accent'
            : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark',
        ].join(' ')}>
          {checked && (
            <svg viewBox="0 0 10 10" fill="none" className="h-2 w-2">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span>
        <span className="block text-xs font-medium text-ink dark:text-ink-dark leading-snug">{label}</span>
        <span className="block text-[11px] text-ink-secondary dark:text-ink-dark-secondary mt-0.5 leading-snug">{description}</span>
      </span>
    </label>
  );
}
