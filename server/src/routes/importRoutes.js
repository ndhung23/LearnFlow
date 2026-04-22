const express = require("express");
const multer = require("multer");
const importController = require("../controllers/importController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware, authorize("admin", "teacher"));

router.get("/", importController.listImportJobs);
router.post("/text", importController.importText);
router.post("/csv", upload.single("file"), importController.importCsv);

module.exports = router;
