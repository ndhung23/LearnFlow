import api from "./api";

const userService = {
  async list(params) {
    const response = await api.get("/users", { params });
    return {
      users: response.data.data,
      pagination: response.data.meta,
    };
  },
  async create(payload) {
    const response = await api.post("/users", payload);
    return response.data.data;
  },
  async update(id, payload) {
    const response = await api.put(`/users/${id}`, payload);
    return response.data.data;
  },
  async remove(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data.data;
  },
};

export default userService;
