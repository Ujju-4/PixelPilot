import { motion } from 'framer-motion';
import type { Recommendation } from '@/types/image';
import { AlertTriangleIcon, CheckCircleIcon, InfoCircleIcon } from '@/components/icons/UploadIcons';

const SEVERITY_STYLES: Record<Recommendation['severity'], { wrapper: string; icon: JSX.Element }> = {
  important: {
    wrapper: 'border-danger/20 bg-danger-subtle dark:border-danger/15 dark:bg-danger/5',
    icon: <AlertTriangleIcon className="h-3.5 w-3.5 text-danger" />,
  },
  suggested: {
    wrapper: 'border-accent/20 bg-accent-subtle dark:border-accent/15 dark:bg-accent-subtle-dark',
    icon: <InfoCircleIcon className="h-3.5 w-3.5 text-accent" />,
  },
  info: {
    wrapper: 'border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark',
    icon: <CheckCircleIcon className="h-3.5 w-3.5 text-success" />,
  },
};

export function RecommendationCard({ recommendation, index = 0 }: { recommendation: Recommendation; index?: number }) {
  const style = SEVERITY_STYLES[recommendation.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={`flex gap-2.5 rounded-xl border px-3 py-2.5 text-left ${style.wrapper}`}
    >
      <div className="mt-0.5 shrink-0">{style.icon}</div>
      <div>
        <p className="text-sm font-semibold leading-snug">{recommendation.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary dark:text-ink-dark-secondary">
          {recommendation.description}
        </p>
      </div>
    </motion.div>
  );
}
