import api from './api'

/**
 * Servicio para gestión de órdenes de cliente
 */
class OrdenesService {
  /**
   * Obtener lista de órdenes
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de órdenes
   */
  async getOrdenes(params = {}) {
    const response = await api.get('/ordenes', { params })
    return response.data
  }

  /**
   * Obtener una orden por ID
   * @param {number} id - ID de la orden
   * @returns {Promise} Datos de la orden
   */
  async getOrden(id) {
    const response = await api.get(`/ordenes/${id}`)
    return response.data
  }

  /**
   * Crear una nueva orden
   * @param {Object} ordenData - Datos de la orden
   * @returns {Promise} Orden creada
   */
  async createOrden(ordenData) {
    const response = await api.post('/ordenes', ordenData)
    return response.data
  }

  /**
   * Actualizar una orden
   * @param {number} id - ID de la orden
   * @param {Object} ordenData - Datos actualizados
   * @returns {Promise} Orden actualizada
   */
  async updateOrden(id, ordenData) {
    const response = await api.put(`/ordenes/${id}`, ordenData)
    return response.data
  }

  /**
   * Actualizar el estado de una orden
   * @param {number} id - ID de la orden
   * @param {string} estado - Nuevo estado (pendiente, en_proceso, completada, cancelada)
   * @returns {Promise} Orden actualizada
   */
  async updateEstadoOrden(id, estado) {
    const response = await api.patch(`/ordenes/${id}/estado`, { estado })
    return response.data
  }

  /**
   * Eliminar una orden
   * @param {number} id - ID de la orden
   * @returns {Promise} Respuesta de eliminación
   */
  async deleteOrden(id) {
    const response = await api.delete(`/ordenes/${id}`)
    return response.data
  }

  /**
   * Obtener órdenes pendientes
   * @returns {Promise} Órdenes con estado pendiente
   */
  async getOrdenesPendientes() {
    return this.getOrdenes({ estado: 'pendiente' })
  }

  /**
   * Obtener órdenes por cliente
   * @param {number} clienteId - ID del cliente
   * @returns {Promise} Órdenes del cliente
   */
  async getOrdenesPorCliente(clienteId) {
    return this.getOrdenes({ cliente: clienteId })
  }
}

export default new OrdenesService()
