interface StatusPillProps {
  state: 'connected' | 'connecting' | 'offline';
}

const LABEL: Record<StatusPillProps['state'], string> = {
  connected: 'Backend connected',
  connecting: 'Connecting…',
  offline: 'Backend offline',
};

const DOT_CLASS: Record<StatusPillProps['state'], string> = {
  connected: 'bg-success',
  connecting: 'bg-accent animate-pulse',
  offline: 'bg-danger',
};

export function StatusPill({ state }: StatusPillProps) {
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1 rounded-full border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark px-2.5 py-0.5 text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary"
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[state]}`} aria-hidden="true" />
      {LABEL[state]}
    </span>
  );
}
