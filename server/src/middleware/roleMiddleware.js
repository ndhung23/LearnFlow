const AppError = require("../utils/AppError");

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication is required.", 401));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(new AppError("You do not have access to this resource.", 403));
    }

    return next();
  };
}

module.exports = authorize;
