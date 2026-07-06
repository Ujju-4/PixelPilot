import { BatchDropzone } from '@/components/upload/BatchDropzone';

export function BatchPage() {
  return (
    <div className="mx-auto max-w-3xl px-3 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Batch processing</h1>
        <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-dark-secondary">
          Upload up to 20 images at once. Each is analysed in parallel and all results are available
          as a single ZIP download.
        </p>
      </div>
      <BatchDropzone />
    </div>
  );
}
