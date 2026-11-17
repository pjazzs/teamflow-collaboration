const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const recordActivity = require("../utils/recordActivity");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateTask = (query) =>
  query
    .populate("project", "name status color")
    .populate("assignedTo", "name email role");

// Validate that an assignee is an active member of the project
const validateAssignee = async (assignedTo, project) => {
  if (assignedTo === null || assignedTo === "") {
    return { valid: true, userId: null };
  }

  if (typeof assignedTo !== "string" || !isValidId(assignedTo)) {
    return {
      valid: false,
      status: 400,
      message: "Invalid assigned member ID",
    };
  }

  const user = await User.findOne({
    _id: assignedTo,
    isActive: true,
  });

  if (!user) {
    return {
      valid: false,
      status: 400,
      message: "Assigned member does not exist or is inactive",
    };
  }

  const isProjectMember = project.members.some(
    (memberId) => memberId.toString() === user._id.toString(),
  );

  if (!isProjectMember) {
    return {
      valid: false,
      status: 400,
      message: "Assigned member must belong to the selected project",
    };
  }

  return { valid: true, userId: user._id };
};

// @desc    Get tasks accessible to the current user
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }

    if (req.query.projectId) {
      if (!isValidId(req.query.projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const projectFilter = { _id: req.query.projectId };

      if (req.user.role !== "admin") {
        projectFilter.members = req.user._id;
      }

      const project = await Project.findOne(projectFilter);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found or access denied",
        });
      }

      filter.project = project._id;
    }

    const tasks = await populateTask(Task.find(filter)).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single accessible task
// @route   GET /api/tasks/:id
const getTask = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const filter = { _id: req.params.id };

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }

    const task = await populateTask(Task.findOne(filter));

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied",
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

// @desc    Create a task (admin only)
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      status,
      priority,
      dueDate,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!projectId || !isValidId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    let assigneeId = null;

    if (assignedTo !== undefined) {
      const validation = await validateAssignee(assignedTo, project);

      if (!validation.valid) {
        return res.status(validation.status).json({
          success: false,
          message: validation.message,
        });
      }

      assigneeId = validation.userId;
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      project: project._id,
      assignedTo: assigneeId,
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
      metadata: {
        assignedTo: assigneeId,
      },
    });

    const populatedTask = await populateTask(Task.findById(task._id));

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

// @desc    Update a task (admin only)
// @route   PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const existingTask = await Task.findById(req.params.id);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "projectId",
      "assignedTo",
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

    const projectId = Object.prototype.hasOwnProperty.call(updates, "projectId")
      ? updates.projectId
      : existingTask.project;

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

    const projectChanged =
      project._id.toString() !== existingTask.project.toString();

    // Moving a task to another project clears its previous
    // assignment unless a new assignee is explicitly supplied.
    let assignedTo = Object.prototype.hasOwnProperty.call(updates, "assignedTo")
      ? updates.assignedTo
      : projectChanged
        ? null
        : existingTask.assignedTo;

    if (assignedTo !== null && assignedTo !== undefined) {
      assignedTo = assignedTo.toString();
    }

    const validation = await validateAssignee(assignedTo, project);

    if (!validation.valid) {
      return res.status(validation.status).json({
        success: false,
        message: validation.message,
      });
    }

    updates.project = project._id;
    updates.assignedTo = validation.userId;
    delete updates.projectId;

    const previousStatus = existingTask.status;
    const previousProjectId = existingTask.project;

    Object.assign(existingTask, updates);
    await existingTask.save();

    const task = await populateTask(Task.findById(existingTask._id));

    const isCompleted =
      previousStatus !== "completed" && task.status === "completed";

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
        newStatus: task.status,
        currentStatus: task.status,
        assignedTo: validation.userId,
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

// @desc    Delete a task (admin only)
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
      task: taskId,
      metadata: {
        previousStatus: task.status,
        projectName: task.project?.name || "",
      },
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status with role-based permissions
// @route   PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const allowedStatuses = ["todo", "in-progress", "review", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const isAdmin = req.user.role === "admin";

    const filter = { _id: id };

    if (!isAdmin) {
      filter.assignedTo = req.user._id;
    }

    const task = await Task.findOne(filter);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or access denied",
      });
    }

    const previousStatus = task.status;

    if (!isAdmin) {
      if (status === "completed") {
        return res.status(403).json({
          success: false,
          message: "Only an admin can mark a task as completed",
        });
      }

      const memberTransitions = {
        todo: ["in-progress"],
        "in-progress": ["review"],
        review: [],
        completed: [],
      };

      const allowedNextStatuses = memberTransitions[previousStatus] || [];

      if (status !== previousStatus && !allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change task status from "${previousStatus}" to "${status}"`,
        });
      }
    }

    if (previousStatus === status) {
      const populatedTask = await populateTask(Task.findById(task._id));

      return res.status(200).json({
        success: true,
        message: "Task status is already up to date",
        data: populatedTask,
      });
    }

    task.status = status;
    await task.save();

    const populatedTask = await populateTask(Task.findById(task._id));

    const isCompleted = status === "completed";

    await recordActivity({
      action: isCompleted ? "task-completed" : "task-status-changed",
      description: isCompleted
        ? `Completed task "${task.title}"`
        : `Changed task "${task.title}" from "${previousStatus}" to "${status}"`,
      entityType: "task",
      entityId: task._id,
      entityName: task.title,
      project: task.project,
      task: task._id,
      actor: req.user._id,
      actorName: req.user.name,
      metadata: {
        previousStatus,
        newStatus: status,
        currentStatus: status,
      },
    });

    res.status(200).json({
      success: true,
      message: isCompleted
        ? "Task marked as completed successfully"
        : "Task status updated successfully",
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

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
