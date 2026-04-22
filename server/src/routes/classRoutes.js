const express = require("express");
const classController = require("../controllers/classController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { requireFields } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", classController.listClasses);
router.post("/", authorize("admin", "teacher"), requireFields(["title"]), classController.createClass);
router.get("/:id", classController.getClassDetail);
router.post("/:id/join", authorize("student"), classController.joinClass);
router.get("/:id/students", classController.getClassStudents);

module.exports = router;
