import { spawn } from 'child_process';
import { internalError } from '../utils/errors';
import { config } from '../config/env';

function runTesseract(imagePath: string, extraArgs: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(config.tesseractExecutable, [imagePath, 'stdout', ...extraArgs]);

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', (err) => {
      reject(internalError(`Could not start Tesseract OCR: ${err.message}. Is tesseract-ocr installed? On Windows, set TESSERACT_EXECUTABLE in backend/.env to the full path of tesseract.exe.`));
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(internalError(`OCR failed: ${stderr.trim() || `exit code ${code}`}`));
      }
    });
  });
}

function parseAverageConfidence(tsv: string): number | null {
  const lines = tsv.trim().split('\n').slice(1); // skip header row
  const confidences: number[] = [];

  for (const line of lines) {
    const columns = line.split('\t');
    const level = columns[0];
    const conf = Number(columns[10]);
    const text = (columns[11] ?? '').trim();

    if (level === '5' && text.length > 0 && conf >= 0) {
      confidences.push(conf);
    }
  }

  if (confidences.length === 0) return null;
  const average = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
  return Math.round(average * 10) / 10;
}

export async function extractText(imagePath: string): Promise<{ text: string; wordCount: number; averageConfidence: number | null }> {
  const [text, tsv] = await Promise.all([
    runTesseract(imagePath, []),
    runTesseract(imagePath, ['tsv']),
  ]);

  const trimmedText = text.trim();
  const wordCount = trimmedText.length === 0 ? 0 : trimmedText.split(/\s+/).length;

  return {
    text: trimmedText,
    wordCount,
    averageConfidence: parseAverageConfidence(tsv),
  };
}
