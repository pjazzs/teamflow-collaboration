import api from "./api";

const commentService = {
  getTaskComments: async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  },

  createComment: async (taskId, commentData) => {
    const response = await api.post(`/comments/task/${taskId}`, commentData);

    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default commentService;
