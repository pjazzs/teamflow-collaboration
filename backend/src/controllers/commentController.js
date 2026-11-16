const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const recordActivity = require("../utils/recordActivity");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all comments for a task
// @route   GET /api/comments/task/:taskId
const getTaskComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    if (!isValidId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const taskExists = await Task.exists({ _id: taskId });

    if (!taskExists) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a comment for a task
// @route   POST /api/comments/task/:taskId
const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 2000 characters",
      });
    }

    const task = await Task.findById(taskId).populate("project", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comment = await Comment.create({
      task: task._id,
      author: req.user._id,
      authorName: req.user.name,
      content: content.trim(),
    });

    await comment.populate("author", "name");

    await recordActivity({
      action: "comment-created",
      description: `${req.user.name} commented on "${task.title}"`,
      actorName: req.user.name,
      entityType: "comment",
      entityId: comment._id,
      entityName: task.title,
      project: task.project?._id || null,
      task: task._id,
      metadata: {
        commentId: comment._id,
        taskTitle: task.title,
        projectName: task.project?.name || "",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment ID",
      });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isAuthor =
      comment.author && comment.author.toString() === req.user._id.toString();

    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment",
      });
    }

    const task = await Task.findById(comment.task).populate("project", "name");

    const commentId = comment._id;
    const taskId = comment.task;
    const authorName = comment.authorName;
    const projectId = task?.project?._id || null;
    const taskTitle = task?.title || "Deleted task";

    await comment.deleteOne();

    await recordActivity({
      action: "comment-deleted",
      description: `${req.user.name} deleted a comment by ${authorName} from "${taskTitle}"`,
      actorName: req.user.name,
      entityType: "comment",
      entityId: commentId,
      entityName: taskTitle,
      project: projectId,
      task: taskId,
      metadata: {
        commentAuthor: authorName,
        taskTitle,
        projectName: task?.project?.name || "",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaskComments,
  createComment,
  deleteComment,
};
