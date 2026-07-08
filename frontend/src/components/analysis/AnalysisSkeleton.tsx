// Mirrors OverviewPanel's actual shape (title, then a property grid) so the
// loading state doesn't jump when real data arrives. Sized for the 296px
// properties panel, not a full-width page.
export function AnalysisSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5" aria-hidden="true">
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-2/3 rounded-full bg-border/40 dark:bg-border-dark/40" />
        <div className="h-3 w-1/3 rounded-full bg-border/30 dark:bg-border-dark/30" />
      </div>

      <div className="border-t border-border/50 pt-4 dark:border-border-dark/40">
        <div className="mb-2.5 h-2.5 w-16 rounded-full bg-border/30 dark:bg-border-dark/30" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="h-2 w-10 rounded-full bg-border/30 dark:bg-border-dark/30" />
              <div className="h-3 w-16 rounded-full bg-border/40 dark:bg-border-dark/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
