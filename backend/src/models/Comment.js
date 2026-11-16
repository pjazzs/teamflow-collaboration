const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Comment must belong to a task"],
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },

    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },

    authorName: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [80, "Author name cannot exceed 80 characters"],
    },
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ task: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);
