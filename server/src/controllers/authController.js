const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess, normalizeEmail } = require("../utils/helpers");
const { createToken, sanitizeUser, hashPassword, checkPassword } = require("./shared");

exports.register = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  if (!["teacher", "student"].includes(req.body.role)) {
    throw new AppError("You can only self-register as teacher or student.", 400);
  }

  const user = await User.create({
    name: req.body.fullName,
    email,
    password: await hashPassword(req.body.password),
    role: req.body.role,
  });

  res.status(201).json(
    formatSuccess({
      token: createToken(user._id.toString()),
      user: sanitizeUser(user),
    })
  );
});

exports.login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password.", 401);
  }

  const valid = await checkPassword(req.body.password, user.password);

  if (!valid) {
    throw new AppError("Invalid email or password.", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json(
    formatSuccess({
      token: createToken(user._id.toString()),
      user: sanitizeUser(user),
    })
  );
});

exports.me = asyncHandler(async (req, res) => {
  res.json(formatSuccess(sanitizeUser(req.user)));
});
