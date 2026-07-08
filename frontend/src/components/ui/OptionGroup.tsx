import { useId } from 'react';
import { motion } from 'framer-motion';

interface OptionGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

// A single segmented-control track instead of a row of separate boxed
// buttons — one container, with a sliding pill marking the active option.
export function OptionGroup<T extends string>({ label, options, value, onChange }: OptionGroupProps<T>) {
  const groupId = useId();

  return (
    <div>
      <p className="mb-1.5 text-[9px] font-semibold text-ink-tertiary dark:text-ink-dark-tertiary tracking-widest uppercase">
        {label}
      </p>
      <div className="inline-flex w-full items-stretch rounded-md bg-black/[0.03] p-0.5 dark:bg-white/[0.04]">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={[
                'relative min-h-[24px] flex-1 rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight text-center transition-colors duration-150',
                isActive
                  ? 'text-ink dark:text-ink-dark'
                  : 'text-ink-secondary hover:text-ink dark:text-ink-dark-secondary dark:hover:text-ink-dark',
              ].join(' ')}
            >
              {isActive && (
                <motion.span
                  layoutId={`option-group-${groupId}`}
                  className="absolute inset-0 rounded bg-surface shadow-sm dark:bg-surface-dark"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
