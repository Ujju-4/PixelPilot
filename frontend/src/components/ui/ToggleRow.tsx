interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className={[
      'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150',
      checked
        ? 'border-accent/30 dark:border-accent/20 bg-accent-subtle dark:bg-accent-subtle-dark'
        : 'border-border/50 dark:border-border-dark/50 hover:border-border dark:hover:border-border-dark bg-canvas dark:bg-canvas-dark',
    ].join(' ')}>
      <div className="mt-0.5 relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        {/* Custom toggle */}
        <div className={[
          'h-4 w-4 rounded flex items-center justify-center transition-all duration-150 border',
          checked
            ? 'bg-accent border-accent'
            : 'border-border dark:border-border-dark bg-surface dark:bg-surface-dark',
        ].join(' ')}>
          {checked && (
            <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-ink-secondary dark:text-ink-dark-secondary mt-0.5">{description}</span>
      </span>
    </label>
  );
}
