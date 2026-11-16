import api from "./api";

const activityService = {
  getActivities: async (limit = 20) => {
    const response = await api.get("/activities", {
      params: { limit },
    });

    return response.data;
  },
};

export default activityService;
