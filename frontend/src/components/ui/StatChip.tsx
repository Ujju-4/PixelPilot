interface StatChipProps {
  label: string;
  value: string;
}

export function StatChip({ label, value }: StatChipProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded border border-border/40 dark:border-border-dark/40 bg-canvas dark:bg-canvas-dark px-2.5 py-2">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary leading-none">
        {label}
      </p>
      <p className="font-mono text-xs font-medium text-ink dark:text-ink-dark truncate leading-snug">
        {value}
      </p>
    </div>
  );
}
