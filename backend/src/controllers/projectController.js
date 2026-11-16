const Project = require("../models/Project");
const Task = require("../models/Task");
const recordActivity = require("../utils/recordActivity");

// @desc    Get all projects
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    next(error);
  }
};

// @desc    Create a project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, status, priority, startDate, dueDate, color } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      startDate: startDate || null,
      dueDate: dueDate || null,
      color,
    });

    await recordActivity({
      action: "project-created",
      description: `Created project "${project.name}"`,
      entityType: "project",
      entityId: project._id,
      entityName: project.name,
      project: project._id,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
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

// @desc    Update a project
// @route   PATCH /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "status",
      "priority",
      "startDate",
      "dueDate",
      "color",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (
      Object.prototype.hasOwnProperty.call(updates, "name") &&
      typeof updates.name === "string"
    ) {
      updates.name = updates.name.trim();
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await recordActivity({
      action: "project-updated",
      description: `Updated project "${project.name}"`,
      entityType: "project",
      entityId: project._id,
      entityName: project.name,
      project: project._id,
      metadata: {
        updatedFields: Object.keys(updates),
      },
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectId = project._id;
    const projectName = project.name;

    // Delete all tasks belonging to this project
    await Task.deleteMany({ project: projectId });

    // Delete the project
    await project.deleteOne();

    await recordActivity({
      action: "project-deleted",
      description: `Deleted project "${projectName}"`,
      entityType: "project",
      entityId: projectId,
      entityName: projectName,
    });

    res.status(200).json({
      success: true,
      message: "Project and its associated tasks deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
