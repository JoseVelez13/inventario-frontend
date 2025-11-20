import axios from "axios";

const API = "http://127.0.0.1:8000/api/clientes/";

export default {
  async getClientes() {
    const res = await axios.get(API);
    return res.data;
  },

  async getCliente(id) {
    const res = await axios.get(`${API}${id}/`);
    return res.data;
  },

  async createCliente(data) {
    const res = await axios.post(API, data, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  },

  async updateCliente(id, data) {
    const res = await axios.put(`${API}${id}/`, data, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  },

  async deleteCliente(id) {
    const res = await axios.delete(`${API}${id}/`);
    return res.data;
  }
};
