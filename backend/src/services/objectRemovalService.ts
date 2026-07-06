import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { badRequest, internalError } from '../utils/errors';
import { config } from '../config/env';

const SCRIPT_PATH = path.resolve(__dirname, '..', '..', 'scripts', 'remove_object.py');
const DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,(.+)$/;

function decodeMaskDataUrl(dataUrl: string): Buffer {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    throw badRequest('"maskDataUrl" must be a base64 image data URL (e.g. "data:image/png;base64,...").');
  }
  return Buffer.from(match[2], 'base64');
}

export async function removeObject(inputBuffer: Buffer, maskDataUrl: string): Promise<Buffer> {
  const maskBuffer = decodeMaskDataUrl(maskDataUrl);

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `pixelpilot-objin-${uuidv4()}.png`);
  const maskPath = path.join(tmpDir, `pixelpilot-objmask-${uuidv4()}.png`);
  const outputPath = path.join(tmpDir, `pixelpilot-objout-${uuidv4()}.png`);

  fs.writeFileSync(inputPath, inputBuffer);
  fs.writeFileSync(maskPath, maskBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(config.pythonExecutable, [SCRIPT_PATH, inputPath, maskPath, outputPath]);

      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        reject(internalError(`Could not start object removal process: ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else if (code === 3) {
          reject(badRequest('The mask is empty. Paint over the object you want to remove first.'));
        } else {
          reject(internalError(`Object removal failed: ${stderr.trim() || `exit code ${code}`}`));
        }
      });
    });

    if (!fs.existsSync(outputPath)) {
      throw internalError('Object removal did not produce an output file.');
    }

    return fs.readFileSync(outputPath);
  } finally {
    for (const p of [inputPath, maskPath, outputPath]) {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
}
