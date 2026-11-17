const express = require("express");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = require("../controllers/taskController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All task routes require authentication
router.use(protect);

// Get tasks accessible to the authenticated user
router.get("/", getTasks);

// Create task (admin only)
router.post("/", authorizeRoles("admin"), createTask);

router.patch("/:id/status", updateTaskStatus);

// Get a single task
router.get("/:id", getTask);

// Update task details (admin only)
router.patch("/:id", authorizeRoles("admin"), updateTask);

// Delete task (admin only)
router.delete("/:id", authorizeRoles("admin"), deleteTask);

module.exports = router;
