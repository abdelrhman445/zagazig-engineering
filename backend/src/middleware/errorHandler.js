const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // --- Mongoose: Bad ObjectId (CastError) ---
  // Triggered when an invalid MongoDB ID format is passed (e.g., "abc" instead of a valid 24-char hex)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}". Please provide a valid resource ID.`;
  }

  // --- Mongoose: Duplicate Key Error ---
  // Triggered when a unique field (e.g., admin username) already exists
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists.`;
  }

  // --- Mongoose: Validation Error ---
  // Triggered when schema validation fails on create/update
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // --- JWT: Invalid Signature ---
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  // --- JWT: Expired Token ---
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Log the full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 ERROR:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  } else {
    // In production, only log unexpected 5xx errors
    if (statusCode >= 500) {
      console.error('🔴 SERVER ERROR:', err.message);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
