import api from './api'

/**
 * Servicio para gestión de usuarios
 */
class UsuariosService {
  /**
   * Obtener lista de usuarios
   * @returns {Promise} Lista de usuarios
   */
  async getUsuarios() {
    const response = await api.get('/usuarios/')
    return response.data
  }

  /**
   * Obtener un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise} Datos del usuario
   */
  async getUsuario(id) {
    const response = await api.get(`/usuarios/${id}/`)
    return response.data
  }

  /**
   * Obtener información del usuario actual
   * @returns {Promise} Datos del usuario autenticado
   */
  async getMe() {
    const response = await api.get('/usuarios/me/')
    return response.data
  }

  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise} Usuario creado
   */
  async createUsuario(userData) {
    const response = await api.post('/usuarios/', userData)
    return response.data
  }

  /**
   * Actualizar un usuario
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos actualizados
   * @returns {Promise} Usuario actualizado
   */
  async updateUsuario(id, userData) {
    const response = await api.put(`/usuarios/${id}/`, userData)
    return response.data
  }

  /**
   * Eliminar un usuario
   * @param {number} id - ID del usuario
   * @returns {Promise}
   */
  async deleteUsuario(id) {
    const response = await api.delete(`/usuarios/${id}/`)
    return response.data
  }
}

export default new UsuariosService()
