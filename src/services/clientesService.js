import api from './api'

/**
 * Servicio para gestión de clientes
 */
class ClientesService {
  /**
   * Obtener lista de clientes
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de clientes
   */
  async getClientes(params = {}) {
    const response = await api.get('/clientes', { params })
    return response.data
  }

  /**
   * Obtener un cliente por ID
   * @param {number} id - ID del cliente
   * @returns {Promise} Datos del cliente
   */
  async getCliente(id) {
    const response = await api.get(`/clientes/${id}`)
    return response.data
  }

  /**
   * Crear un nuevo cliente
   * @param {Object} clienteData - Datos del cliente
   * @returns {Promise} Cliente creado
   */
  async createCliente(clienteData) {
    const response = await api.post('/clientes', clienteData)
    return response.data
  }

  /**
   * Actualizar un cliente
   * @param {number} id - ID del cliente
   * @param {Object} clienteData - Datos actualizados
   * @returns {Promise} Cliente actualizado
   */
  async updateCliente(id, clienteData) {
    const response = await api.put(`/clientes/${id}`, clienteData)
    return response.data
  }

  /**
   * Eliminar un cliente
   * @param {number} id - ID del cliente
   * @returns {Promise} Respuesta de eliminación
   */
  async deleteCliente(id) {
    const response = await api.delete(`/clientes/${id}`)
    return response.data
  }

  /**
   * Buscar clientes por término
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise} Clientes encontrados
   */
  async searchClientes(searchTerm) {
    return this.getClientes({ search: searchTerm })
  }
}

export default new ClientesService()
