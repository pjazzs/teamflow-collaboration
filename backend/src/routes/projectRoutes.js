const express = require("express");

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

router.route("/").get(getProjects).post(createProject);

router.route("/:id").get(getProject).patch(updateProject).delete(deleteProject);

module.exports = router;
