import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;
  uploadsDir: string;
  outputsDir: string;
  historyDir: string;
  maxUploadSizeBytes: number;
  pythonExecutable: string;
  tesseractExecutable: string;
}

const rootDir = path.resolve(__dirname, '..', '..');

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  uploadsDir: path.join(rootDir, 'uploads'),
  outputsDir: path.join(rootDir, 'outputs'),
  historyDir: path.join(rootDir, 'storage', 'history'),
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_BYTES ?? 25 * 1024 * 1024),
  // On Windows: set PYTHON_EXECUTABLE=python  (or the full path to python.exe)
  // On macOS/Linux: python3 is usually correct; use PYTHON_EXECUTABLE=python if not.
  pythonExecutable: process.env.PYTHON_EXECUTABLE ?? (process.platform === 'win32' ? 'python' : 'python3'),
  // On Windows: set TESSERACT_EXECUTABLE to the full path to tesseract.exe
  // e.g. C:\Program Files\Tesseract-OCR\tesseract.exe
  tesseractExecutable: process.env.TESSERACT_EXECUTABLE ?? 'tesseract',
};
