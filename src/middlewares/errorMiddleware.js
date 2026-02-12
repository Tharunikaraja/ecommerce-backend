const errorMiddleware = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || null;

  res.status(status).json({
    success: false,
    status,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

module.exports = errorMiddleware;
