import api from "./api";

const notificationService = {
  async list() {
    const response = await api.get("/notifications");
    return response.data.data;
  },
  async markRead(id) {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data.data;
  },
};

export default notificationService;
