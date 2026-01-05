import api from './api'

/**
 * Servicio para gestión de proveedores
 */
class ProveedoresService {
  /**
   * Obtener lista de proveedores
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise} Lista de proveedores
   */
  async getProveedores(params = {}) {
    const response = await api.get('/proveedores/', { params })
    return response.data
  }

  /**
   * Obtener un proveedor por ID
   * @param {number} id - ID del proveedor
   * @returns {Promise} Datos del proveedor
   */
  async getProveedor(id) {
    const response = await api.get(`/proveedores/${id}/`)
    return response.data
  }

  /**
   * Crear un nuevo proveedor
   * @param {Object} data - Datos del proveedor
   * @returns {Promise} Proveedor creado
   */
  async createProveedor(data) {
    const response = await api.post('/proveedores/', data)
    return response.data
  }

  /**
   * Actualizar un proveedor
   * @param {number} id - ID del proveedor
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Proveedor actualizado
   */
  async updateProveedor(id, data) {
    const response = await api.put(`/proveedores/${id}/`, data)
    return response.data
  }

  /**
   * Eliminar un proveedor
   * @param {number} id - ID del proveedor
   * @returns {Promise}
   */
  async deleteProveedor(id) {
    const response = await api.delete(`/proveedores/${id}/`)
    return response.data
  }
}

export default new ProveedoresService()
