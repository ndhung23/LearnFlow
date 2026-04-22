const express = require("express");
const studySetController = require("../controllers/studySetController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", studySetController.listStudySets);
router.post("/", authorize("admin", "teacher"), studySetController.createStudySet);
router.get("/:id", studySetController.getStudySetDetail);
router.put("/:id", authorize("admin", "teacher"), studySetController.updateStudySet);
router.delete("/:id", authorize("admin", "teacher"), studySetController.deleteStudySet);
router.post("/:id/bookmark", studySetController.bookmarkStudySet);
router.delete("/:id/bookmark", studySetController.removeBookmark);
router.post("/:id/duplicate", studySetController.duplicateStudySet);
router.post("/:id/progress", studySetController.saveProgress);

module.exports = router;
