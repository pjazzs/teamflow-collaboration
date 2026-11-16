const express = require("express");

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for every project endpoint
router.use(protect);

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).patch(updateProject).delete(deleteProject);

module.exports = router;
