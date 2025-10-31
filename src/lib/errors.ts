/**
 * Base API Error class with HTTP status code
 */
export class APIError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class AuthorizationError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Authenticated but not authorized for this resource
 */
export class ForbiddenError extends APIError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends APIError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends APIError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends APIError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
