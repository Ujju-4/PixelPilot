interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// A row in a list, separated by a hairline — not its own bordered/tinted
// card. Six of these stacked should read as one checklist, not six boxes.
export function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 border-b border-border/50 py-3 first:pt-0 last:border-0 last:pb-0 dark:border-border-dark/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        aria-hidden="true"
        className={[
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150',
          checked
            ? 'border-accent bg-accent'
            : 'border-border bg-transparent group-hover:border-ink-tertiary dark:border-border-dark dark:group-hover:border-ink-dark-tertiary',
        ].join(' ')}
      >
        {checked && (
          <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span
          className={[
            'block text-[13px] font-medium leading-snug break-words transition-colors duration-150',
            checked ? 'text-ink dark:text-ink-dark' : 'text-ink-secondary dark:text-ink-dark-secondary',
          ].join(' ')}
        >
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug break-words text-ink-secondary/70 dark:text-ink-dark-secondary/70">
          {description}
        </span>
      </span>
    </label>
  );
}
