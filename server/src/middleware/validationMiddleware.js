const AppError = require("../utils/AppError");

function requireFields(fields = []) {
  return (req, _res, next) => {
    const missingFields = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === "";
    });

    if (missingFields.length) {
      return next(
        new AppError(
          `Missing required fields: ${missingFields.join(", ")}.`,
          400
        )
      );
    }

    return next();
  };
}

function validateEnum(field, allowedValues = []) {
  return (req, _res, next) => {
    const value = req.body[field];

    if (value === undefined || value === null || value === "") {
      return next();
    }

    if (!allowedValues.includes(value)) {
      return next(
        new AppError(
          `Invalid value for ${field}. Allowed values: ${allowedValues.join(
            ", "
          )}.`,
          400
        )
      );
    }

    return next();
  };
}

module.exports = {
  requireFields,
  validateEnum,
};
