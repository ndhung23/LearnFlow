const express = require("express");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", notificationController.listNotifications);
router.post("/:id/read", notificationController.markAsRead);

module.exports = router;
