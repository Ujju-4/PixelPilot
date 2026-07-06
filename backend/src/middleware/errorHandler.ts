import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ApiException } from '../utils/errors';
import type { ApiError } from '../types/api';

export const notFoundHandler = (req: Request, res: Response): void => {
  const body: ApiError = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} does not exist`,
    },
  };
  res.status(404).json(body);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res: Response, _next: NextFunction) => {
  if (err instanceof ApiException) {
    const body: ApiError = {
      success: false,
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large for the configured upload limit.'
        : err.message;
    const body: ApiError = {
      success: false,
      error: { code: err.code, message },
    };
    res.status(400).json(body);
    return;
  }

  const message = err instanceof Error ? err.message : 'Unexpected server error';
  console.error('[Unhandled Error]', err);

  const body: ApiError = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message },
  };
  res.status(500).json(body);
};
