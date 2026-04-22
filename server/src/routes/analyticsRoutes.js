const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/admin/stats", authMiddleware, authorize("admin"), analyticsController.getAdminStats);
router.get("/teacher/stats", authMiddleware, authorize("teacher"), analyticsController.getTeacherStats);
router.get("/student/stats", authMiddleware, authorize("student"), analyticsController.getStudentStats);

module.exports = router;
