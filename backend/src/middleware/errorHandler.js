import { ApiError } from '../utils/apiError.js';
import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const error = err instanceof ApiError ? err : new ApiError(500, err.message);
  const status = error.status ?? 500;

  if (status >= 500) {
    logger.error('Unhandled error', {
      status,
      message: error.message,
      details: error.details
    });
  } else {
    logger.warn('API error', {
      status,
      message: error.message,
      details: error.details
    });
  }

  res.status(status).json({
    error: {
      message: error.message,
      details: error.details
    }
  });
};
