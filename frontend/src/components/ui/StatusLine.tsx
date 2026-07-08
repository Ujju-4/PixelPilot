import type { ReactNode } from 'react';

type Tone = 'success' | 'danger' | 'neutral';

interface StatusLineProps {
  tone?: Tone;
  children: ReactNode;
}

const DOT_CLASS: Record<Tone, string> = {
  success: 'bg-success',
  danger: 'bg-danger',
  neutral: 'bg-ink-tertiary dark:bg-ink-dark-tertiary',
};

const TEXT_CLASS: Record<Tone, string> = {
  success: 'text-success',
  danger: 'text-danger',
  neutral: 'text-ink-secondary dark:text-ink-dark-secondary',
};

/**
 * Informational status — a dot plus text, no container. Used anywhere a tool
 * needs to communicate state (applied, ready, idle) without it reading as
 * another card. Shared across every tool panel and the export section.
 */
export function StatusLine({ tone = 'neutral', children }: StatusLineProps) {
  return (
    <p className={`flex items-center gap-1.5 text-xs font-medium ${TEXT_CLASS[tone]}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[tone]}`} aria-hidden="true" />
      {children}
    </p>
  );
}
