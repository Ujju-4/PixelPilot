import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMetadata } from '@/services/editsService';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Button } from '@/components/ui/Button';

interface MetadataToolProps {
  imageId: string;
}

function MetaRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 border-b border-border/40 dark:border-border-dark/40 py-2 last:border-0">
      <span className="w-28 shrink-0 text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary pt-0.5">{label}</span>
      <span className="font-mono text-xs leading-relaxed break-all">{value}</span>
    </div>
  );
}

function formatExposure(s: number): string {
  return s >= 1 ? `${s}s` : `1/${Math.round(1 / s)}s`;
}

export function MetadataTool({ imageId }: MetadataToolProps) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['metadata', imageId],
    queryFn: () => fetchMetadata(imageId),
    retry: 1,
    staleTime: Infinity,
    enabled: false,
  });

  const data = query.data;
  const cameraLine = [data?.camera.make, data?.camera.model].filter(Boolean).join(' ') || null;
  const gpsUrl = data?.gps
    ? `https://www.openstreetmap.org/?mlat=${data.gps.latitude}&mlon=${data.gps.longitude}&zoom=14`
    : null;

  const errorMessage = query.error instanceof Error ? query.error.message : query.isError ? 'Failed to read metadata.' : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
        Reads embedded camera, lens, exposure, and GPS data from the image file.
      </p>

      {!query.isFetched && (
        <Button
          onClick={() => query.refetch()}
          loading={query.isFetching}
          disabled={query.isFetching}
          className="self-start"
        >
          {query.isFetching ? 'Reading metadata…' : 'Read metadata'}
        </Button>
      )}

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => queryClient.removeQueries({ queryKey: ['metadata', imageId] })} />}

      <AnimatePresence>
        {data && (
          <motion.div
            key="metadata"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark px-3 py-1"
          >
            <MetaRow
              label="Dimensions"
              value={data.dimensions.width && data.dimensions.height
                ? `${data.dimensions.width} × ${data.dimensions.height} px`
                : null}
            />
            {!data.hasExifData ? (
              <p className="py-3 text-xs italic text-ink-secondary dark:text-ink-dark-secondary">
                No camera or GPS metadata found.
              </p>
            ) : (
              <>
                <MetaRow label="Camera" value={cameraLine} />
                <MetaRow label="Lens" value={data.lens.model} />
                <MetaRow label="ISO" value={data.iso !== null ? String(data.iso) : null} />
                <MetaRow label="Aperture" value={data.fNumber !== null ? `f/${data.fNumber}` : null} />
                <MetaRow label="Shutter" value={data.exposureTime !== null ? formatExposure(data.exposureTime) : null} />
                <MetaRow label="Focal length" value={data.focalLength !== null ? `${data.focalLength}mm` : null} />
                <MetaRow label="Date taken" value={data.dateTaken ?? null} />
                {gpsUrl && (
                  <div className="flex items-start gap-3 py-2">
                    <span className="w-28 shrink-0 text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary pt-0.5">GPS</span>
                    <a
                      href={gpsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                    >
                      {data.gps!.latitude.toFixed(6)}, {data.gps!.longitude.toFixed(6)}
                    </a>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {query.isFetched && (
        <Button variant="ghost" size="sm" onClick={() => query.refetch()} loading={query.isFetching} className="self-start">
          Refresh
        </Button>
      )}
    </div>
  );
}
