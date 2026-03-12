export function errorHandler(err, req, res, _next) {
  console.error('Server error:', err);

  if (res.headersSent) {
    return;
  }

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
  });
}

