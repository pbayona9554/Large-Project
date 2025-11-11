// src/middleware/errorMiddleware.js

// Handles requests to undefined routes
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General error-handling middleware
exports.errorHandler = (err, req, res, next) => {
  console.error("Error handler caught:", err);

  // Default to 500 if status code not already set
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
