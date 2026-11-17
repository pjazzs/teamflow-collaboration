const express = require("express");

const {
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
} = require("../controllers/userController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Team directory
router.get("/", getUsers);
router.get("/:id", getUserById);

// Admin-only management
router.patch("/:id/role", authorizeRoles("admin"), updateUserRole);
router.patch("/:id/status", authorizeRoles("admin"), updateUserStatus);

module.exports = router;
