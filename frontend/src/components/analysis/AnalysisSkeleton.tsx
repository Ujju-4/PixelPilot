export function AnalysisSkeleton() {
  return (
    <div className="grid w-full animate-pulse gap-3 sm:grid-cols-[minmax(0,220px)_1fr]" aria-hidden="true">
      <div className="min-h-[180px] rounded-xl bg-border/30 dark:bg-border-dark/30" />
      <div className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <div className="h-3.5 w-2/3 rounded-full bg-border/30 dark:bg-border-dark/30" />
          <div className="h-3 w-1/3 rounded-full bg-border/30 dark:bg-border-dark/30" />
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-border/30 dark:bg-border-dark/30" />
          ))}
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-border/30 dark:bg-border-dark/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
