import { motion } from 'framer-motion';
import type { UploadImageResponse } from '@/types/image';
import { formatBytes } from '@/utils/fileValidation';
import { StatChip } from '@/components/ui/StatChip';
import { RecommendationCard } from '@/components/analysis/RecommendationCard';

const EXPOSURE_LABEL: Record<string, string> = {
  underexposed: 'Under',
  normal: 'Normal',
  overexposed: 'Over',
};

const TYPE_LABEL: Record<string, string> = {
  portrait: 'Portrait',
  product: 'Product',
  'text-document': 'Document',
  screenshot: 'Screenshot',
  'empty-space': 'Minimal',
  photograph: 'Photo',
};

export function OverviewPanel({ result }: { result: UploadImageResponse }) {
  const { asset, analysis, recommendations } = result;
  const primaryType = analysis.classification?.detectedTypes?.[0];
  const typeLabel = primaryType ? TYPE_LABEL[primaryType] : analysis.classification?.primaryLabel;

  // Strip UUID from name display
  const displayName = (() => {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i;
    if (uuidPattern.test(asset.originalName)) return 'Uploaded image';
    return asset.originalName;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3"
    >
      {/* Image identity */}
      <div>
        <div className="flex items-start gap-1.5">
          <h2 className="text-sm font-semibold text-ink dark:text-ink-dark break-all leading-snug flex-1 min-w-0">
            {displayName}
          </h2>
          {typeLabel && (
            <span className="shrink-0 inline-flex items-center rounded border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink-secondary dark:text-ink-dark-secondary">
              {typeLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-ink-secondary dark:text-ink-dark-secondary">
          AI analysis complete
          {recommendations.length > 0 && ` · ${recommendations.length} suggestion${recommendations.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* Property grid */}
      <div>
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          Properties
        </p>
        <div className="grid grid-cols-2 gap-1">
          <StatChip label="Width" value={`${analysis.resolution.width}px`} />
          <StatChip label="Height" value={`${analysis.resolution.height}px`} />
          <StatChip label="Megapixels" value={`${analysis.resolution.megapixels} MP`} />
          <StatChip label="Format" value={asset.format.toUpperCase()} />
          <StatChip label="Size" value={formatBytes(asset.sizeBytes)} />
          <StatChip label="Exposure" value={EXPOSURE_LABEL[analysis.exposure.classification] ?? 'Normal'} />
        </div>
      </div>

      {/* Insights */}
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
          Insights
        </p>
        <div className="grid grid-cols-2 gap-1">
          <StatChip label="Contrast" value={analysis.contrast.isLowContrast ? 'Low' : 'Good'} />
          <StatChip label="Dimensions" value={`${analysis.resolution.width} × ${analysis.resolution.height}`} />
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-ink-tertiary dark:text-ink-dark-tertiary">
            Suggestions
          </p>
          <div className="flex flex-col gap-1">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={rec.id} recommendation={rec} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
