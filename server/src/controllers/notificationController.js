const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { formatSuccess } = require("../utils/helpers");

exports.listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);

  res.json(
    formatSuccess(
      notifications.map((notification) => ({
        id: notification._id.toString(),
        _id: notification._id,
        message: notification.message,
        title: notification.type,
        type: notification.type,
        link: notification.link,
        is_read: notification.read,
        created_at: notification.createdAt,
      }))
    )
  );
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    throw new AppError("Notification not found.", 404);
  }

  notification.read = true;
  await notification.save();

  res.json(formatSuccess({ id: notification._id.toString(), is_read: notification.read }));
});
