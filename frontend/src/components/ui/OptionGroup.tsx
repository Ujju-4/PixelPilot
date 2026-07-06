interface OptionGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function OptionGroup<T extends string>({ label, options, value, onChange }: OptionGroupProps<T>) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary tracking-wide uppercase">{label}</p>
      <div className="inline-flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className={[
              'rounded-full px-3 py-1 text-sm font-medium transition-all duration-150 border',
              value === option.value
                ? 'bg-ink dark:bg-ink-dark text-canvas dark:text-canvas-dark border-transparent shadow-sm'
                : 'border-border/60 dark:border-border-dark/60 text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark hover:border-border dark:hover:border-border-dark bg-transparent',
            ].join(' ')}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
