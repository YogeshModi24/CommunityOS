import { ApplicationError } from './ApplicationError';

export { ApplicationError };

export class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found', details?: any) {
    super(message, 404, 'NOT_FOUND', false, details);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 400, 'VALIDATION_FAILED', false, details);
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', false, details);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized access', details?: any) {
    super(message, 401, 'UNAUTHORIZED', false, details);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = 'Forbidden access', details?: any) {
    super(message, 403, 'FORBIDDEN', false, details);
  }
}

export class InternalServerError extends ApplicationError {
  constructor(message = 'Internal server error', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', true, details);
  }
}
