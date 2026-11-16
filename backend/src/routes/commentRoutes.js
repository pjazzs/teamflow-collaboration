const express = require("express");

const {
  getTaskComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication for every comment endpoint
router.use(protect);

router.route("/task/:taskId").get(getTaskComments).post(createComment);

router.delete("/:id", deleteComment);

module.exports = router;
