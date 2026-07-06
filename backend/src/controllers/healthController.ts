import type { Request, Response } from 'express';
import type { ApiResponse, HealthStatus } from '../types/api';
import { config } from '../config/env';

export const getHealth = (_req: Request, res: Response<ApiResponse<HealthStatus>>): void => {
  const body: ApiResponse<HealthStatus> = {
    success: true,
    data: {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    },
  };
  res.status(200).json(body);
};
