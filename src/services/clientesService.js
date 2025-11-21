import api from "./api"

export default {
  async getClientes() {
    const res = await api.get("/clientes/")
    return res.data
  },

  async getCliente(id) {
    const res = await api.get(`/clientes/${id}/`)
    return res.data
  },

  async createCliente(data) {
    const res = await api.post("/clientes/", data)
    return res.data
  },

  async updateCliente(id, data) {
    const res = await api.put(`/clientes/${id}/`, data)
    return res.data
  },

  async deleteCliente(id) {
    const res = await api.delete(`/clientes/${id}/`)
    return res.data
  },
}
