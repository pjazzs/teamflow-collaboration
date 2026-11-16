const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Activity action is required"],
      enum: [
        "project-created",
        "project-updated",
        "project-deleted",
        "task-created",
        "task-updated",
        "task-completed",
        "task-deleted",
        "comment-created",
        "comment-deleted",
      ],
    },

    description: {
      type: String,
      required: [true, "Activity description is required"],
      trim: true,
      maxlength: [300, "Activity description cannot exceed 300 characters"],
    },

    actorName: {
      type: String,
      trim: true,
      maxlength: [80, "Actor name cannot exceed 80 characters"],
      default: "Team member",
    },

    entityType: {
      type: String,
      required: true,
      enum: ["project", "task", "comment"],
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    entityName: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
