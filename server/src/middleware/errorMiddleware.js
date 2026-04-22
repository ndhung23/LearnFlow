const AppError = require("../utils/AppError");

function notFoundMiddleware(req, _res, next) {
  next(new AppError(`Route ${req.originalUrl} was not found.`, 404));
}

function errorMiddleware(error, _req, res, _next) {
  let normalizedError = error;

  if (!(error instanceof AppError)) {
    if (error.code === "23505") {
      normalizedError = new AppError("A record with this value already exists.", 409, {
        constraint: error.constraint,
      });
    } else if (error.code === "23503") {
      normalizedError = new AppError("A related record could not be found.", 400, {
        constraint: error.constraint,
      });
    } else if (error.code === "22P02") {
      normalizedError = new AppError("One or more values have an invalid format.", 400);
    } else if (error.code === "ECONNREFUSED") {
      normalizedError = new AppError("Cannot connect to MongoDB. Start the database and verify MONGO_URI.", 503);
    } else if (error.name === "ValidationError") {
      normalizedError = new AppError(
        "Validation failed.",
        400,
        Object.values(error.errors).map((item) => item.message)
      );
    } else if (error.code === 11000) {
      normalizedError = new AppError("A record with this value already exists.", 409);
    } else if (error.name === "CastError") {
      normalizedError = new AppError("One or more ids are invalid.", 400);
    } else {
      normalizedError = new AppError(
        error.message || "Internal server error.",
        error.statusCode || 500
      );
    }
  }

  if (normalizedError.statusCode >= 500) {
    console.error(normalizedError);
  }

  res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    ...(normalizedError.details ? { details: normalizedError.details } : {}),
  });
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
