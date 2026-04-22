import api from "./api";

const importService = {
  async listJobs() {
    const response = await api.get("/import");
    return response.data.data;
  },
  async importText(payload) {
    const response = await api.post("/import/text", payload);
    return response.data.data;
  },
  async importCsv(formData) {
    const response = await api.post("/import/csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};

export default importService;
