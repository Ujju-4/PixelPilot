import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { badRequest, internalError } from '../utils/errors';
import { config } from '../config/env';

const SCRIPT_PATH = path.resolve(__dirname, '..', '..', 'scripts', 'magic_expand.py');
const MAX_EXPAND_PX = 2000;

export async function magicExpand(
  inputBuffer: Buffer,
  amounts: { top: number; right: number; bottom: number; left: number },
): Promise<Buffer> {
  const { top, right, bottom, left } = amounts;

  for (const [side, value] of Object.entries({ top, right, bottom, left })) {
    if (!Number.isFinite(value) || value < 0) {
      throw badRequest(`Expand amount for "${side}" must be a non-negative number.`);
    }
    if (value > MAX_EXPAND_PX) {
      throw badRequest(`Expand amount for "${side}" must be ${MAX_EXPAND_PX}px or less.`);
    }
  }
  if (top + right + bottom + left === 0) {
    throw badRequest('At least one side must have a non-zero expand amount.');
  }

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `pixelpilot-expandin-${uuidv4()}.png`);
  const outputPath = path.join(tmpDir, `pixelpilot-expandout-${uuidv4()}.png`);

  fs.writeFileSync(inputPath, inputBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(config.pythonExecutable, [
        SCRIPT_PATH,
        inputPath,
        outputPath,
        String(Math.round(top)),
        String(Math.round(right)),
        String(Math.round(bottom)),
        String(Math.round(left)),
      ]);

      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        reject(internalError(`Could not start Magic Expand process: ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(internalError(`Magic Expand failed: ${stderr.trim() || `exit code ${code}`}`));
        }
      });
    });

    if (!fs.existsSync(outputPath)) {
      throw internalError('Magic Expand did not produce an output file.');
    }

    return fs.readFileSync(outputPath);
  } finally {
    for (const p of [inputPath, outputPath]) {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
}
