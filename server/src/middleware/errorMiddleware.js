/**
 * Global Express error handling middleware
 * Hides stack traces, database errors, and sensitive internals in production
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.name === 'CastError' ? 400 : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error details in non-production environments
  if (!isProduction) {
    console.error(`[Error Handler] ${err.name || 'Error'}: ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  // Handle payload size exceeded error from Express json parser
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Payload size exceeds the allowed limit (10KB).',
    });
  }

  // Handle syntax error from malformed JSON in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
    });
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'An unexpected error occurred.',
  });
};
