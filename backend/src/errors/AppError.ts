export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperationalError: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperationalError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
