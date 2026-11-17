const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Project = require("../models/Project");
const Task = require("../models/Task");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get recent activities
// @route   GET /api/activities
// @query   projectId, taskId, limit
const getActivities = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.query;

    if (projectId && !isValidId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (taskId && !isValidId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const requestedLimit =
      req.query.limit === undefined ? 20 : Number(req.query.limit);

    if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive integer",
      });
    }

    const limit = Math.min(requestedLimit, 100);
    const isAdmin = req.user.role === "admin";

    const filter = {};

    if (projectId) {
      filter.project = projectId;
    }

    if (taskId) {
      filter.task = taskId;
    }

    if (!isAdmin) {
      const userId = req.user._id;

      // Get projects where the member currently belongs.
      const accessibleProjectIds = await Project.find({
        members: userId,
      }).distinct("_id");

      // Get tasks assigned to the member within
      // projects they currently belong to.
      const accessibleTaskIds = await Task.find({
        assignedTo: userId,
        project: { $in: accessibleProjectIds },
      }).distinct("_id");

      // A requested project must belong to the member.
      if (
        projectId &&
        !accessibleProjectIds.some(
          (id) => id.toString() === projectId.toString(),
        )
      ) {
        return res.status(404).json({
          success: false,
          message: "Project not found or access denied",
        });
      }

      // A requested task must be assigned to the member
      // and belong to an accessible project.
      if (
        taskId &&
        !accessibleTaskIds.some((id) => id.toString() === taskId.toString())
      ) {
        return res.status(404).json({
          success: false,
          message: "Task not found or access denied",
        });
      }

      // Project-level activities have no task reference.
      // Task-level activities must reference an assigned task.
      //
      // Using $or ensures that project membership alone
      // does not expose another member's task activities.
      filter.$or = [
        {
          project: { $in: accessibleProjectIds },
          task: null,
        },
        {
          task: { $in: accessibleTaskIds },
        },
      ];
    }

    const activities = await Activity.find(filter)
      .populate("actor", "name email")
      .populate("project", "name")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivities,
};
