import api from "./api";

const userService = {
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(`/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.patch(`/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  },
};

export default userService;
