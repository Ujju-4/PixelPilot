import type { Recommendation } from '@/types/image';

const SEVERITY_BAR: Record<Recommendation['severity'], string> = {
  important: 'border-danger',
  suggested: 'border-accent',
  info: 'border-border dark:border-border-dark',
};

// A left accent bar instead of a filled/bordered box — matches ErrorBanner's
// language for "this deserves attention," scaled down for a sidebar list.
export function RecommendationCard({ recommendation }: { recommendation: Recommendation; index?: number }) {
  return (
    <div className={`border-l-2 py-0.5 pl-2.5 ${SEVERITY_BAR[recommendation.severity]}`}>
      <p className="text-xs font-semibold leading-snug break-words text-ink dark:text-ink-dark">{recommendation.title}</p>
      <p className="mt-0.5 text-[11px] leading-relaxed break-words text-ink-secondary dark:text-ink-dark-secondary">
        {recommendation.description}
      </p>
    </div>
  );
}
