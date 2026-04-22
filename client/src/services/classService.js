import api from "./api";

const classService = {
  async list() {
    const response = await api.get("/classes");
    return response.data.data;
  },
  async getById(id) {
    const response = await api.get(`/classes/${id}`);
    return response.data.data;
  },
  async create(payload) {
    const response = await api.post("/classes", payload);
    return response.data.data;
  },
  async join(id) {
    const response = await api.post(`/classes/${id}/join`);
    return response.data.data;
  },
};

export default classService;
