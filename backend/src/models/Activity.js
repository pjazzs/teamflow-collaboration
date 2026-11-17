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
        "task-status-changed",
        "task-completed",
        "task-deleted",
        "comment-created",
        "comment-deleted",
        "project-members-updated",
      ],
    },

    description: {
      type: String,
      required: [true, "Activity description is required"],
      trim: true,
      maxlength: [300, "Activity description cannot exceed 300 characters"],
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

// Require appropriate references for new activity records.
activitySchema.pre("validate", function () {
  const action = this.action || "";

  if (action.startsWith("project-")) {
    if (!this.project) {
      this.invalidate("project", "Project activities must reference a project");
    }

    if (this.task) {
      this.invalidate("task", "Project activities must not reference a task");
    }
  }

  if (action.startsWith("task-") || action.startsWith("comment-")) {
    if (!this.project) {
      this.invalidate(
        "project",
        "Task and comment activities must reference a project",
      );
    }

    if (!this.task) {
      this.invalidate(
        "task",
        "Task and comment activities must reference a task",
      );
    }
  }
});

activitySchema.index({ createdAt: -1 });
activitySchema.index({ actor: 1, createdAt: -1 });
activitySchema.index({ project: 1, createdAt: -1 });
activitySchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
