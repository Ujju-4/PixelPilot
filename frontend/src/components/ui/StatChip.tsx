interface StatChipProps {
  label: string;
  value: string;
}

// A plain label/value pair — no border, no fill. A grid of these reads as a
// spec sheet, not a row of dashboard widgets.
export function StatChip({ label, value }: StatChipProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary leading-none">
        {label}
      </p>
      <p className="font-mono text-xs font-medium text-ink dark:text-ink-dark truncate leading-snug">
        {value}
      </p>
    </div>
  );
}
