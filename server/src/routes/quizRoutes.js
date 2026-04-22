const express = require("express");
const quizController = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { requireFields } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", authorize("admin", "teacher"), requireFields(["studySetId", "title"]), quizController.createQuiz);
router.get("/:id", quizController.getQuiz);
router.post("/:id/submit", quizController.submitQuiz);

module.exports = router;
