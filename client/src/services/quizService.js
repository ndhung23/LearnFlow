import api from "./api";

const quizService = {
  async getById(id, params = {}) {
    const response = await api.get(`/quizzes/${id}`, { params });
    return response.data.data;
  },
  async create(payload) {
    const response = await api.post("/quizzes", payload);
    return response.data.data;
  },
  async submit(id, payload) {
    const response = await api.post(`/quizzes/${id}/submit`, payload);
    return response.data.data;
  },
};

export default quizService;
