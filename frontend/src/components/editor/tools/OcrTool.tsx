import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { runOcr } from '@/services/editsService';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { CheckCircleIcon } from '@/components/icons/UploadIcons';
import { ApiRequestError } from '@/services/apiClient';

export function OcrTool({ imageId }: { imageId: string }) {
  const [copied, setCopied] = useState(false);

  const mutation = useMutation({
    mutationFn: () => runOcr(imageId),
  });

  const handleCopy = () => {
    if (!mutation.data?.text) return;
    navigator.clipboard.writeText(mutation.data.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!mutation.data?.text) return;
    const blob = new Blob([mutation.data.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorMessage = mutation.error instanceof ApiRequestError
    ? mutation.error.message
    : mutation.error ? 'Text extraction failed.' : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
        Extracts readable text using Tesseract OCR. Works on documents, screenshots, and signs.
      </p>

      <Button onClick={() => mutation.mutate()} loading={mutation.isPending} disabled={mutation.isPending} className="self-start">
        {mutation.isPending ? 'Extracting text…' : 'Extract text'}
      </Button>

      {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => mutation.reset()} />}

      <AnimatePresence>
        {mutation.isSuccess && (
          <motion.div
            key="ocr-result"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap gap-3 text-xs text-ink-secondary dark:text-ink-dark-secondary">
              <span>{mutation.data.wordCount} word{mutation.data.wordCount !== 1 ? 's' : ''}</span>
              {mutation.data.averageConfidence !== null && (
                <>
                  <span className="text-ink-tertiary dark:text-ink-dark-tertiary">·</span>
                  <span>{mutation.data.averageConfidence}% confidence</span>
                </>
              )}
            </div>

            {mutation.data.text.length === 0 ? (
              <p className="text-sm italic text-ink-secondary dark:text-ink-dark-secondary">
                No readable text found in this image.
              </p>
            ) : (
              <>
                <textarea
                  readOnly
                  value={mutation.data.text}
                  rows={Math.min(10, mutation.data.text.split('\n').length + 2)}
                  className="w-full resize-y rounded-lg border border-border dark:border-border-dark bg-transparent px-3 py-2.5 font-mono text-sm focus:border-accent focus:outline-none"
                  aria-label="Extracted text"
                />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={handleCopy} icon={copied ? <CheckCircleIcon className="h-4 w-4 text-success" /> : undefined}>
                    {copied ? 'Copied!' : 'Copy text'}
                  </Button>
                  <Button variant="secondary" onClick={handleDownload}>
                    Download .txt
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
