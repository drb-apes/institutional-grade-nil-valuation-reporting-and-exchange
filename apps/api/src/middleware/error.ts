import type { NextFunction, Request, Response } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * Global error handler middleware.
 */
export function errorHandler(
  error: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  console.error('[Error]', {
    statusCode,
    message,
    context: error.context,
    stack: error.stack,
  });

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { context: error.context }),
  });
}

/**
 * Not found handler.
 */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}
