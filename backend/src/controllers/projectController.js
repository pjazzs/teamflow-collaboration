const Project = require("../models/Project");
const Task = require("../models/Task");
const recordActivity = require("../utils/recordActivity");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc    Get all projects
// @route   GET /api/projects

// @desc    Get projects accessible to the current user
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

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

// @desc    Get a single accessible project
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const filter = {
      _id: id,
    };

    if (req.user.role !== "admin") {
      filter.members = req.user._id;
    }

    const project = await Project.findOne(filter).populate(
      "members",
      "name email role",
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
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
      actor: req.user._id,
      actorName: req.user.name,
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
      actor: req.user._id,
      actorName: req.user.name,
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
      project: projectId,
      actor: req.user._id,
      actorName: req.user.name,
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

// @desc    Update project members
// @route   PATCH /api/projects/:id/members

// @desc    Update project members and revoke removed assignments
// @route   PATCH /api/projects/:id/members
const updateProjectMembers = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: "Members must be provided as an array.",
      });
    }

    if (
      members.some(
        (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more member IDs are invalid.",
      });
    }

    const uniqueMemberIds = [...new Set(members.map((id) => id.toLowerCase()))];

    let removedMemberIds = [];
    let unassignedTaskCount = 0;

    await session.withTransaction(async () => {
      const project = await Project.findById(req.params.id).session(session);

      if (!project) {
        const error = new Error("Project not found.");
        error.statusCode = 404;
        throw error;
      }

      const validUsers = await User.find({
        _id: { $in: uniqueMemberIds },
        isActive: true,
      })
        .select("_id")
        .session(session);

      if (validUsers.length !== uniqueMemberIds.length) {
        const error = new Error(
          "One or more selected members do not exist or are inactive.",
        );
        error.statusCode = 400;
        throw error;
      }

      const nextMemberSet = new Set(uniqueMemberIds);

      removedMemberIds = project.members.filter(
        (memberId) => !nextMemberSet.has(memberId.toString().toLowerCase()),
      );

      project.members = uniqueMemberIds;
      await project.save({ session });

      if (removedMemberIds.length > 0) {
        const result = await Task.updateMany(
          {
            project: project._id,
            assignedTo: { $in: removedMemberIds },
          },
          {
            $set: { assignedTo: null },
          },
          { session },
        );

        unassignedTaskCount = result.modifiedCount;
      }
    });

    const populatedProject = await Project.findById(req.params.id).populate(
      "members",
      "name email role",
    );

    await recordActivity({
      action: "project-members-updated",
      description: `Updated team members for project "${populatedProject.name}"`,
      entityType: "project",
      entityId: populatedProject._id,
      entityName: populatedProject.name,
      project: populatedProject._id,
      actor: req.user._id,
      actorName: req.user.name,
      metadata: {
        memberCount: uniqueMemberIds.length,
        removedMemberIds,
        unassignedTaskCount,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project members updated successfully.",
      data: populatedProject,
      unassignedTaskCount,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectMembers,
};
