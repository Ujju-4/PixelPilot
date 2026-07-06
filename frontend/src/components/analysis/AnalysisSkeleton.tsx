export function AnalysisSkeleton() {
  return (
    <div className="grid w-full animate-pulse gap-4 sm:grid-cols-[minmax(0,240px)_1fr]" aria-hidden="true">
      <div className="min-h-[200px] rounded-2xl bg-border/30 dark:bg-border-dark/30" />
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="h-4 w-2/3 rounded-full bg-border/30 dark:bg-border-dark/30" />
          <div className="h-3 w-1/3 rounded-full bg-border/30 dark:bg-border-dark/30" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-border/30 dark:bg-border-dark/30" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-border/30 dark:bg-border-dark/30" />
          ))}
        </div>
      </div>
    </div>
  );
}
