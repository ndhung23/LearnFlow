const express = require("express");
const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { requireFields } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", assignmentController.listAssignments);
router.post("/", authorize("admin", "teacher"), requireFields(["title"]), assignmentController.createAssignment);
router.get("/:id", assignmentController.getAssignmentDetail);

module.exports = router;
