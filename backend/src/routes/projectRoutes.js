const express = require("express");

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
} = require("../controllers/projectController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// All project routes require authentication
router.use(protect);

// Get accessible projects
router.get("/", getProjects);

// Create project (admin only)
router.post("/", authorizeRoles("admin"), createProject);

// Manage project members (admin only)
router.patch("/:id/members", authorizeRoles("admin"), updateProjectMembers);

// Get a single accessible project
router.get("/:id", getProject);

// Update project (admin only)
router.patch("/:id", authorizeRoles("admin"), updateProject);

// Delete project (admin only)
router.delete("/:id", authorizeRoles("admin"), deleteProject);

module.exports = router;
