import api from "./api";

const assignmentService = {
  async list() {
    const response = await api.get("/assignments");
    return response.data.data;
  },
  async getById(id) {
    const response = await api.get(`/assignments/${id}`);
    return response.data.data;
  },
  async create(payload) {
    const response = await api.post("/assignments", payload);
    return response.data.data;
  },
};

export default assignmentService;
