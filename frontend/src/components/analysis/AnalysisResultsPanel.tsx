import { motion } from 'framer-motion';
import type { UploadImageResponse } from '@/types/image';
import { formatBytes } from '@/utils/fileValidation';
import { StatChip } from '@/components/ui/StatChip';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { RecommendationCard } from '@/components/analysis/RecommendationCard';

interface AnalysisResultsPanelProps {
  result: UploadImageResponse;
  previewUrl: string;
}

const EXPOSURE_LABEL: Record<string, string> = {
  underexposed: 'Underexposed',
  normal: 'Normal exposure',
  overexposed: 'Overexposed',
};

const TYPE_EMOJI: Record<string, string> = {
  portrait: '🧑',
  product: '📦',
  'text-document': '📄',
  screenshot: '🖥',
  'empty-space': '⬜',
  photograph: '📷',
};

export function AnalysisResultsPanel({ result, previewUrl }: AnalysisResultsPanelProps) {
  const { asset, analysis, recommendations } = result;
  const primaryType = analysis.classification?.detectedTypes?.[0];
  const typeEmoji = primaryType ? TYPE_EMOJI[primaryType] : null;
  const typeLabel = analysis.classification?.primaryLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid w-full gap-3 sm:grid-cols-[minmax(0,240px)_1fr]"
    >
      {/* Zoomable image viewer */}
      <ImageViewer
        src={previewUrl}
        alt={`Preview of ${asset.originalName}`}
        className="min-h-[180px] sm:min-h-[240px]"
      />

      <div className="flex flex-col gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h2 className="font-medium break-all">{asset.originalName}</h2>
            {typeEmoji && typeLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark px-2 py-0.5 text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary">
                {typeEmoji} {typeLabel}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-dark-secondary">
            AI analysis complete · {recommendations.length} recommendation
            {recommendations.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          <StatChip label="Dimensions" value={`${analysis.resolution.width} × ${analysis.resolution.height}`} />
          <StatChip label="Megapixels" value={`${analysis.resolution.megapixels} MP`} />
          <StatChip label="Format" value={asset.format.toUpperCase()} />
          <StatChip label="File size" value={formatBytes(asset.sizeBytes)} />
          <StatChip label="Exposure" value={EXPOSURE_LABEL[analysis.exposure.classification]} />
          <StatChip label="Contrast" value={analysis.contrast.isLowContrast ? 'Flat' : 'Healthy'} />
        </div>

        <div className="flex flex-col gap-1.5">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={rec.id} recommendation={rec} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
