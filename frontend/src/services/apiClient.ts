import type { ApiResult } from '@/types/api';

export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiRequestError';
  }
}

const BASE_URL = import.meta.env.PROD
  ? 'https://backend-production-18f78.up.railway.app/api'
  : 'http://localhost:4000/api';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const body = (await response.json()) as ApiResult<T>;

  if (!body.success) {
    throw new ApiRequestError(response.status, body.error.code, body.error.message);
  }

  return body.data;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResult<T>;

  if (!body.success) {
    throw new ApiRequestError(response.status, body.error.code, body.error.message);
  }

  return body.data;
}

/**
 * Uploads form data via XHR (rather than fetch) so we can report real upload
 * progress percentages.
 */
export function apiUpload<T>(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', `${BASE_URL}${path}`);
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      const body = xhr.response as ApiResult<T>;

      if (!body || typeof body !== 'object') {
        reject(
          new ApiRequestError(
            xhr.status,
            'INVALID_RESPONSE',
            'Server returned an unreadable response.',
          ),
        );
        return;
      }

      if (!body.success) {
        reject(
          new ApiRequestError(
            xhr.status,
            body.error.code,
            body.error.message,
          ),
        );
        return;
      }

      resolve(body.data);
    };

    xhr.onerror = () => {
      reject(
        new ApiRequestError(
          0,
          'NETWORK_ERROR',
          'Could not reach the server. Check your connection and try again.',
        ),
      );
    };

    xhr.send(formData);
  });
}