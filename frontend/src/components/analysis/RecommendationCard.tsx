import { motion } from 'framer-motion';
import type { Recommendation } from '@/types/image';
import { AlertTriangleIcon, CheckCircleIcon, InfoCircleIcon } from '@/components/icons/UploadIcons';

const SEVERITY_STYLES: Record<Recommendation['severity'], { wrapper: string; icon: JSX.Element }> = {
  important: {
    wrapper: 'border-danger/15 bg-danger-subtle dark:border-danger/10 dark:bg-danger/5',
    icon: <AlertTriangleIcon className="h-3 w-3 text-danger shrink-0" />,
  },
  suggested: {
    wrapper: 'border-accent/15 bg-accent-subtle dark:border-accent/10 dark:bg-accent-subtle-dark',
    icon: <InfoCircleIcon className="h-3 w-3 text-accent shrink-0" />,
  },
  info: {
    wrapper: 'border-border/40 dark:border-border-dark/40 bg-canvas dark:bg-canvas-dark',
    icon: <CheckCircleIcon className="h-3 w-3 text-success shrink-0" />,
  },
};

export function RecommendationCard({ recommendation, index = 0 }: { recommendation: Recommendation; index?: number }) {
  const style = SEVERITY_STYLES[recommendation.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      className={`flex gap-2 rounded border px-2.5 py-2 text-left ${style.wrapper}`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold leading-snug text-ink dark:text-ink-dark">{recommendation.title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {recommendation.description}
        </p>
      </div>
    </motion.div>
  );
}
