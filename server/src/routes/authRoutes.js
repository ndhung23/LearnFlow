const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireFields, validateEnum } = require("../middleware/validationMiddleware");

const router = express.Router();

router.post(
  "/register",
  requireFields(["fullName", "email", "password", "role"]),
  validateEnum("role", ["teacher", "student"]),
  authController.register
);
router.post("/login", requireFields(["email", "password"]), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;
