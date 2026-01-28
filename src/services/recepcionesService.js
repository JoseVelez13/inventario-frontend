import api from './api'

/**
 * Servicio para gestión de recepciones de material y productos
 */
class RecepcionesService {
    /**
     * Obtener lista de recepciones (alias para getRecepcionesMaterial)
     * @param {Object} params - Parámetros de búsqueda y paginación
     * @returns {Promise} Lista de recepciones
     */
    async getRecepciones(params = {}) {
      return this.getRecepcionesMaterial(params)
    }
  // ============================================
  // RECEPCIONES DE MATERIAL (Materias Primas)
  // ============================================

  /**
   * Obtener lista de recepciones de material
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise} Lista de recepciones
   */
  async getRecepcionesMaterial(params = {}) {
    const response = await api.get('/recepciones/', { params })
    return response.data
  }

  /**
   * Obtener una recepción de material por ID
   * @param {number} id - ID de la recepción
   * @returns {Promise} Datos de la recepción
   */
  async getRecepcionMaterial(id) {
    const response = await api.get(`/recepciones/${id}/`)
    return response.data
  }

  /**
   * Crear una nueva recepción de material
   * @param {Object} data - Datos de la recepción
   * @returns {Promise} Recepción creada
   */
  async createRecepcionMaterial(data) {
    const response = await api.post('/recepciones/', data)
    return response.data
  }

  /**
   * Actualizar una recepción de material
   * @param {number} id - ID de la recepción
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Recepción actualizada
   */
  async updateRecepcionMaterial(id, data) {
    const response = await api.put(`/recepciones/${id}/`, data)
    return response.data
  }

  /**
   * Eliminar una recepción de material
   * @param {number} id - ID de la recepción
   * @returns {Promise}
   */
  async deleteRecepcionMaterial(id) {
    const response = await api.delete(`/recepciones/${id}/`)
    return response.data
  }

  // ============================================
  // RECEPCIONES DE ITEMS (Productos)
  // ============================================

  /**
   * Obtener lista de recepciones de items/productos
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise} Lista de recepciones
   */
  async getRecepcionesItem(params = {}) {
    // Usar el mismo endpoint que recepciones de material, el backend debería filtrar por tipo
    const response = await api.get('/recepciones/', { params: { ...params, tipo: 'item' } })
    return response.data
  }

  /**
   * Obtener una recepción de item por ID
   * @param {number} id - ID de la recepción
   * @returns {Promise} Datos de la recepción
   */
  async getRecepcionItem(id) {
    const response = await api.get(`/recepciones/${id}/`)
    return response.data
  }

  /**
   * Crear una nueva recepción de item
   * @param {Object} data - Datos de la recepción
   * @returns {Promise} Recepción creada
   */
  async createRecepcionItem(data) {
    const response = await api.post('/recepciones/', { ...data, tipo_recepcion: 'item' })
    return response.data
  }

  /**
   * Actualizar una recepción de item
   * @param {number} id - ID de la recepción
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Recepción actualizada
   */
  async updateRecepcionItem(id, data) {
    const response = await api.put(`/recepciones/${id}/`, data)
    return response.data
  }

  /**
   * Eliminar una recepción de item
   * @param {number} id - ID de la recepción
   * @returns {Promise}
   */
  async deleteRecepcionItem(id) {
    const response = await api.delete(`/recepciones/${id}/`)
    return response.data
  }
}

export default new RecepcionesService()
