import api from "./api";

const studySetService = {
  async list(params) {
    const response = await api.get("/studysets", { params });
    return {
      studySets: response.data.data,
      pagination: response.data.meta,
    };
  },
  async getById(id) {
    const response = await api.get(`/studysets/${id}`);
    return response.data.data;
  },
  async create(payload) {
    const response = await api.post("/studysets", payload);
    return response.data.data;
  },
  async update(id, payload) {
    const response = await api.put(`/studysets/${id}`, payload);
    return response.data.data;
  },
  async remove(id) {
    const response = await api.delete(`/studysets/${id}`);
    return response.data.data;
  },
  async addFlashcard(id, payload) {
    const response = await api.put(`/studysets/${id}`, payload);
    return response.data.data;
  },
  async updateProgress(id, payload) {
    const response = await api.post(`/studysets/${id}/progress`, payload);
    return response.data.data;
  },
  async bookmark(id) {
    const response = await api.post(`/studysets/${id}/bookmark`);
    return response.data.data;
  },
  async unbookmark(id) {
    const response = await api.delete(`/studysets/${id}/bookmark`);
    return response.data.data;
  },
  async duplicate(id) {
    const response = await api.post(`/studysets/${id}/duplicate`);
    return response.data.data;
  },
};

export default studySetService;
