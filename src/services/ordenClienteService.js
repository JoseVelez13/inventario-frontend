import api from "./api"

export default {
  /**
   * Obtener lista de órdenes con paginación
   */
  async getOrdenes(page = 1, pageSize = 20) {
    const res = await api.get("/ordenes-clientes/", {
      params: {
        page,
        page_size: pageSize
      }
    })
    return res.data
  },

  /**
   * Obtener una orden específica por ID
   */
  async getOrden(id) {
    const res = await api.get(`/ordenes-clientes/${id}/`)
    return res.data
  },

  /**
   * Crear nueva orden con items
   */
  async createOrden(data) {
    const res = await api.post("/ordenes-clientes/", data)
    return res.data
  },

  /**
   * Actualizar orden existente
   */
  async updateOrden(id, data) {
    const res = await api.put(`/ordenes-clientes/${id}/`, data)
    return res.data
  },

  /**
   * Eliminar orden
   */
  async deleteOrden(id) {
    const res = await api.delete(`/ordenes-clientes/${id}/`)
    return res.data
  },

  /**
   * Obtener items de una orden
   */
  async getOrdenItems(ordenId) {
    const res = await api.get(`/ordenes-items/?order=${ordenId}`)
    return res.data
  },

  /**
   * Crear item en una orden
   */
  async createItem(data) {
    const res = await api.post("/ordenes-items/", data)
    return res.data
  },

  /**
   * Actualizar item
   */
  async updateItem(id, data) {
    const res = await api.put(`/ordenes-items/${id}/`, data)
    return res.data
  },

  /**
   * Eliminar item
   */
  async deleteItem(id) {
    const res = await api.delete(`/ordenes-items/${id}/`)
    return res.data
  }
}