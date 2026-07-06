import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import type { RemoveBackgroundRequestBody } from '../types/edit';
import { badRequest, internalError } from '../utils/errors';
import { config } from '../config/env';

const SCRIPT_PATH = path.resolve(__dirname, '..', '..', 'scripts', 'remove_background.py');
const HEX_COLOR_PATTERN = /^#?[0-9a-fA-F]{6}$/;

function normalizeHex(value: string): string {
  return value.replace('#', '').toLowerCase();
}

function buildModeArg(options: RemoveBackgroundRequestBody): string {
  switch (options.mode) {
    case 'transparent':
      return 'transparent';
    case 'white':
      return 'white';
    case 'color': {
      if (!options.color || !HEX_COLOR_PATTERN.test(options.color)) {
        throw badRequest('A valid 6-digit hex "color" is required for the "color" background mode.');
      }
      return `color:${normalizeHex(options.color)}`;
    }
    case 'gradient': {
      if (!options.gradientFrom || !options.gradientTo) {
        throw badRequest('Both "gradientFrom" and "gradientTo" hex colors are required for the "gradient" mode.');
      }
      if (!HEX_COLOR_PATTERN.test(options.gradientFrom) || !HEX_COLOR_PATTERN.test(options.gradientTo)) {
        throw badRequest('"gradientFrom" and "gradientTo" must be valid 6-digit hex colors.');
      }
      return `gradient:${normalizeHex(options.gradientFrom)}:${normalizeHex(options.gradientTo)}`;
    }
    default:
      throw badRequest(`Unknown background mode "${options.mode}"`);
  }
}

export async function removeBackground(
  inputBuffer: Buffer,
  options: RemoveBackgroundRequestBody,
): Promise<{ buffer: Buffer; format: 'png' }> {
  const modeArg = buildModeArg(options);

  const tmpDir = os.tmpdir();
  const inputPath = path.join(tmpDir, `pixelpilot-bgin-${uuidv4()}.png`);
  const outputPath = path.join(tmpDir, `pixelpilot-bgout-${uuidv4()}.png`);

  fs.writeFileSync(inputPath, inputBuffer);

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(config.pythonExecutable, [SCRIPT_PATH, inputPath, outputPath, modeArg]);

      let stderr = '';
      proc.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      proc.on('error', (err) => {
        reject(internalError(`Could not start background removal process: ${err.message}`));
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(internalError(`Background removal failed: ${stderr.trim() || `exit code ${code}`}`));
        }
      });
    });

    if (!fs.existsSync(outputPath)) {
      throw internalError('Background removal did not produce an output file.');
    }

    const buffer = fs.readFileSync(outputPath);
    return { buffer, format: 'png' };
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}
