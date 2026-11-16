const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const recordActivity = require("../utils/recordActivity");

// Validate MongoDB IDs
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Get all tasks, optionally filtered by project
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.projectId) {
      if (!isValidId(req.query.projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const projectExists = await Project.exists({
        _id: req.query.projectId,
      });

      if (!projectExists) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      filter.project = req.query.projectId;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name status color")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(req.params.id).populate(
      "project",
      "name status color",
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, status, priority, dueDate } =
      req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
    }

    if (!isValidId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      status,
      priority,
      dueDate: dueDate || null,
    });

    await recordActivity({
      action: "task-created",
      description: `Created task "${task.title}" in "${project.name}"`,
      entityType: "task",
      actor: req.user._id,
      actorName: req.user.name,
      entityId: task._id,
      entityName: task.title,
      project: project._id,
      task: task._id,
    });

    const populatedTask = await Task.findById(task._id).populate(
      "project",
      "name status color",
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
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

// @desc    Update a task
// @route   PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "projectId",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (Object.prototype.hasOwnProperty.call(updates, "title")) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.projectId) {
      if (!isValidId(updates.projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const projectExists = await Project.exists({
        _id: updates.projectId,
      });

      if (!projectExists) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      updates.project = updates.projectId;
      delete updates.projectId;
    }

    // Retrieve the task's previous state
    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const previousStatus = existingTask.status;
    const previousProjectId = existingTask.project;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("project", "name status color");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isCompleted =
      previousStatus !== "completed" && task.status === "completed";

    const projectName = task.project?.name || "Unknown project";

    await recordActivity({
      action: isCompleted ? "task-completed" : "task-updated",
      description: isCompleted
        ? `Completed task "${task.title}"`
        : `Updated task "${task.title}"`,
      entityType: "task",
      entityId: task._id,
      entityName: task.title,
      project: task.project?._id || previousProjectId,
      task: task._id,
      actor: req.user._id,
      actorName: req.user.name,
      metadata: {
        updatedFields: Object.keys(updates),
        previousStatus,
        currentStatus: task.status,
        projectName,
      },
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
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

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(req.params.id).populate("project", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const taskId = task._id;
    const taskTitle = task.title;
    const projectId = task.project?._id || task.project;

    await task.deleteOne();

    await recordActivity({
      action: "task-deleted",
      description: `Deleted task "${taskTitle}"`,
      entityType: "task",
      actor: req.user._id,
      actorName: req.user.name,
      entityId: taskId,
      entityName: taskTitle,
      project: projectId,
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
