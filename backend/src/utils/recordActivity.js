const mongoose = require("mongoose");
const Activity = require("../models/Activity");

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const recordActivity = async (activityData) => {
  try {
    if (
      !activityData ||
      typeof activityData !== "object" ||
      Array.isArray(activityData)
    ) {
      console.error("Activity recording failed: Invalid activity data");
      return null;
    }

    const { actor, project, task, ...rest } = activityData;

    // Validate references when provided.
    for (const [field, value] of Object.entries({
      actor,
      project,
      task,
    })) {
      if (value != null && !isValidId(value)) {
        console.error(`Activity recording failed: Invalid ${field} ID`);
        return null;
      }
    }

    const activity = await Activity.create({
      ...rest,
      actor: actor || null,
      project: project || null,
      task: task || null,
      actorName: activityData.actorName || "Team member",
    });

    return activity;
  } catch (error) {
    console.error("Activity recording failed:", error.message);
    return null;
  }
};

module.exports = recordActivity;
