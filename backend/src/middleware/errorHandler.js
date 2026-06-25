/**
 * Global Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url} - `, err);

  const statusCode = err.status || err.statusCode || 500;
  
  // Clean, structured error response matching the required envelope
  const response = {
    error: true,
    message: err.message || 'An unexpected error occurred.',
  };

  // Provide details in development environments
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
