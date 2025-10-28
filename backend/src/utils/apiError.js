export class ApiError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const createBadRequest = (message, details) =>
  new ApiError(400, message, details);

export const createUnauthorized = (message = 'Unauthorized') =>
  new ApiError(401, message);

export const createForbidden = (message = 'Forbidden') =>
  new ApiError(403, message);

export const createNotFound = (message = 'Not Found') =>
  new ApiError(404, message);

export const createConflict = (message = 'Conflict') =>
  new ApiError(409, message);

export const createServerError = (message = 'Internal Server Error', details) =>
  new ApiError(500, message, details);
