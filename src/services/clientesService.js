import api from "./api"

export default {
  /**
   * Obtener lista de clientes con paginación
   * @param {number} page - Número de página (por defecto 1)
   * @param {number} pageSize - Cantidad de items por página (por defecto 20)
   * @returns {Promise} Objeto con: { count, next, previous, results }
   */
  async getClientes(page = 1, pageSize = 20) {
    const res = await api.get("/clientes/", {
      params: {
        page,
        page_size: pageSize
      }
    })
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