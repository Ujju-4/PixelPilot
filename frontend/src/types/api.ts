export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiSuccess<T> | ApiErrorBody;

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}
