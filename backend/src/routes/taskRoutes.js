const express = require("express");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for every task endpoint
router.use(protect);

router.route("/").get(getTasks).post(createTask);

router.route("/:id").get(getTask).patch(updateTask).delete(deleteTask);

module.exports = router;
