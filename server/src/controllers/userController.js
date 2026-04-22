const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess, buildPagination, normalizeEmail } = require("../utils/helpers");
const { hashPassword, sanitizeUser } = require("./shared");

exports.listUsers = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = buildPagination(req.query);
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(offset).limit(pageSize),
    User.countDocuments(filter),
  ]);

  res.json(
    formatSuccess(
      users.map(sanitizeUser),
      {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      }
    )
  );
});

exports.createUser = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const existing = await User.findOne({ email });

  if (existing) {
    throw new AppError("A user with this email already exists.", 409);
  }

  const user = await User.create({
    name: req.body.fullName,
    email,
    password: await hashPassword(req.body.password),
    role: req.body.role,
    bio: req.body.bio || "",
    avatarUrl: req.body.avatarUrl || "",
  });

  res.status(201).json(formatSuccess(sanitizeUser(user)));
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  if (req.body.fullName !== undefined) user.name = req.body.fullName;
  if (req.body.email !== undefined) user.email = normalizeEmail(req.body.email);
  if (req.body.role !== undefined) user.role = req.body.role;
  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.avatarUrl !== undefined) user.avatarUrl = req.body.avatarUrl;
  if (req.body.isActive !== undefined) user.isActive = Boolean(req.body.isActive);
  if (req.body.password) user.password = await hashPassword(req.body.password);

  await user.save();

  res.json(formatSuccess(sanitizeUser(user)));
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  user.isActive = false;
  await user.save();

  res.json(formatSuccess(sanitizeUser(user)));
});
