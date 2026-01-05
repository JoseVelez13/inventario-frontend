import api from './api'

/**
 * Servicio para gestión de almacenes
 */
class AlmacenesService {
  /**
   * Obtener lista de almacenes
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise} Lista de almacenes
   */
  async getAlmacenes(params = {}) {
    const response = await api.get('/almacenes/', { params })
    return response.data
  }

  /**
   * Obtener un almacén por ID
   * @param {number} id - ID del almacén
   * @returns {Promise} Datos del almacén
   */
  async getAlmacen(id) {
    const response = await api.get(`/almacenes/${id}/`)
    return response.data
  }

  /**
   * Crear un nuevo almacén
   * @param {Object} data - Datos del almacén
   * @returns {Promise} Almacén creado
   */
  async createAlmacen(data) {
    const response = await api.post('/almacenes/', data)
    return response.data
  }

  /**
   * Actualizar un almacén
   * @param {number} id - ID del almacén
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Almacén actualizado
   */
  async updateAlmacen(id, data) {
    const response = await api.put(`/almacenes/${id}/`, data)
    return response.data
  }

  /**
   * Eliminar un almacén
   * @param {number} id - ID del almacén
   * @returns {Promise}
   */
  async deleteAlmacen(id) {
    const response = await api.delete(`/almacenes/${id}/`)
    return response.data
  }
}

export default new AlmacenesService()
