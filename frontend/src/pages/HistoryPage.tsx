import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { listHistory, deleteHistoryEntry, renameHistoryEntry } from '@/services/batchService';
import type { HistoryEntry } from '@/types/history';
import { getImageFileUrl } from '@/services/imagesService';
import { formatBytes } from '@/utils/fileValidation';
import { DownloadIcon } from '@/components/icons/EditorIcons';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

function RelativeTime({ iso }: { iso: string }) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  let label = 'just now';
  if (m >= 1 && h < 1) label = `${m}m ago`;
  else if (h >= 1 && d < 1) label = `${h}h ago`;
  else if (d >= 1) label = `${d}d ago`;
  return <time dateTime={iso} title={new Date(iso).toLocaleString()}>{label}</time>;
}

function HistoryCard({ entry, onDeleted }: { entry: HistoryEntry; onDeleted: () => void }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(entry.name);

  const deleteMutation = useMutation({
    mutationFn: () => deleteHistoryEntry(entry.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      onDeleted();
    },
  });

  const renameMutation = useMutation({
    mutationFn: (name: string) => renameHistoryEntry(entry.id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      setEditing(false);
    },
  });

  const submitRename = () => {
    const t = nameValue.trim();
    if (!t || t === entry.name) { setEditing(false); return; }
    renameMutation.mutate(t);
  };

  const thumbUrl = getImageFileUrl(entry.uploadedAsset.id);
  const allAssets = [entry.uploadedAsset, ...entry.editedAssets];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group flex gap-4 rounded-2xl border border-border/50 dark:border-border-dark/50 bg-surface dark:bg-surface-dark p-4 transition-shadow hover:shadow-card"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0">
        <img
          src={thumbUrl}
          alt=""
          aria-hidden="true"
          className="h-16 w-16 rounded-xl border border-border/40 dark:border-border-dark/40 object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {entry.editedAssets.length > 0 && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border dark:border-border-dark bg-canvas dark:bg-canvas-dark text-[10px] font-bold">
            {entry.editedAssets.length}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* Name / rename */}
        {editing ? (
          <div className="mb-1 flex items-center gap-2">
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setEditing(false); }}
              className="flex-1 rounded-lg border border-accent/40 bg-canvas dark:bg-canvas-dark px-2 py-1 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <Button size="sm" onClick={submitRename} loading={renameMutation.isPending}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mb-0.5 max-w-full truncate text-left text-sm font-semibold hover:text-accent transition-colors"
            title="Click to rename"
          >
            {entry.name}
          </button>
        )}

        <p className="text-xs text-ink-secondary dark:text-ink-dark-secondary">
          <RelativeTime iso={entry.createdAt} />
          {' · '}
          {entry.uploadedAsset.format.toUpperCase()}
          {' · '}
          {formatBytes(entry.uploadedAsset.sizeBytes)}
          {entry.editedAssets.length > 0 && (
            <> · <span className="text-accent">{entry.editedAssets.length} edit{entry.editedAssets.length !== 1 ? 's' : ''}</span></>
          )}
        </p>

        {/* Downloads */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {allAssets.slice(0, 5).map((asset) => (
            <a
              key={asset.id}
              href={`${getImageFileUrl(asset.id)}?download=true`}
              download={asset.originalName}
              className="inline-flex items-center gap-1 rounded-full border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark px-2.5 py-1 text-xs font-medium transition-colors hover:border-border dark:hover:border-border-dark"
            >
              <DownloadIcon className="h-3 w-3" />
              {asset.operation ?? 'original'}
            </a>
          ))}
          {allAssets.length > 5 && (
            <span className="text-xs text-ink-secondary dark:text-ink-dark-secondary self-center">
              +{allAssets.length - 5} more
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        aria-label={`Delete ${entry.name}`}
        className="shrink-0 self-start opacity-0 group-hover:opacity-100 text-ink-secondary hover:text-danger dark:text-ink-dark-secondary dark:hover:text-danger transition-all"
      >
        Delete
      </Button>
    </motion.div>
  );
}

export function HistoryPage() {
  const { data: entries, isLoading, isError, refetch } = useQuery({
    queryKey: ['history'],
    queryFn: listHistory,
    staleTime: 30000,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-ink-secondary dark:text-ink-dark-secondary">
            Your previous uploads and edits, persisted to disk.
          </p>
        </div>
        {entries && entries.length > 0 && (
          <span className="rounded-full border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark px-3 py-1 text-xs font-medium text-ink-secondary dark:text-ink-dark-secondary">
            {entries.length} session{entries.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border/40 dark:border-border-dark/40 bg-surface dark:bg-surface-dark" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorBanner message="Could not load history. The server may be unavailable." onDismiss={() => refetch()} />
      )}

      {entries && entries.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 dark:border-border-dark/60 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 dark:border-border-dark/50 bg-canvas dark:bg-canvas-dark text-2xl">
            📁
          </div>
          <div>
            <p className="font-semibold">No history yet</p>
            <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-dark-secondary">
              Upload an image on the Editor page to get started.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        <div className="flex flex-col gap-3">
          {entries?.map((entry) => (
            <HistoryCard key={entry.id} entry={entry} onDeleted={() => refetch()} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
