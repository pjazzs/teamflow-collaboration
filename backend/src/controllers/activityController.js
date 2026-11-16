const mongoose = require("mongoose");
const Activity = require("../models/Activity");

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

    const filter = {};

    if (projectId) {
      filter.project = projectId;
    }

    if (taskId) {
      filter.task = taskId;
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
