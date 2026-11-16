const Activity = require("../models/Activity");

const recordActivity = async (activityData) => {
  try {
    const activity = await Activity.create({
      ...activityData,
      actorName: activityData.actorName || "Team member",
    });

    return activity;
  } catch (error) {
    console.error("Activity recording failed:", error.message);
    return null;
  }
};

module.exports = recordActivity;
