import api from "./api";

const analyticsService = {
  async adminStats() {
    const response = await api.get("/admin/stats");
    return response.data.data;
  },
  async teacherStats() {
    const response = await api.get("/teacher/stats");
    return response.data.data;
  },
  async studentStats() {
    const response = await api.get("/student/stats");
    return response.data.data;
  },
};

export default analyticsService;
