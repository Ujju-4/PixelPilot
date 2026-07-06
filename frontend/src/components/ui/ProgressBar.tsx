interface ProgressBarProps {
  percent: number;
  label?: string;
}

export function ProgressBar({ percent, label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      {label && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary">{label}</span>
          <span className="font-mono text-xs text-ink-secondary dark:text-ink-dark-secondary">{clamped}%</span>
        </div>
      )}
      <div className="h-1 w-full overflow-hidden rounded-full bg-border/50 dark:bg-border-dark/50">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
