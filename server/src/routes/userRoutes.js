const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { requireFields, validateEnum } = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authMiddleware, authorize("admin"));

router.get("/", userController.listUsers);
router.post(
  "/",
  requireFields(["fullName", "email", "password", "role"]),
  validateEnum("role", ["admin", "teacher", "student"]),
  userController.createUser
);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
