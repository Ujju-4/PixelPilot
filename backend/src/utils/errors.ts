export class ApiException extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiException';
  }
}

export const notFound = (message: string): ApiException =>
  new ApiException(404, 'NOT_FOUND', message);

export const badRequest = (message: string): ApiException =>
  new ApiException(400, 'BAD_REQUEST', message);

export const internalError = (message: string): ApiException =>
  new ApiException(500, 'INTERNAL_ERROR', message);
