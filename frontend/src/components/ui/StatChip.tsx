interface StatChipProps {
  label: string;
  value: string;
}

export function StatChip({ label, value }: StatChipProps) {
  return (
    <div className="rounded-xl border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-secondary dark:text-ink-dark-secondary">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium truncate">{value}</p>
    </div>
  );
}
