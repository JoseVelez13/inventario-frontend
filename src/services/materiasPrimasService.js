import api from './api'

/**
 * Servicio para gestión de materias primas
 */
class MateriasPrimasService {
  /**
   * Obtener lista de materias primas
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de materias primas
   */
  async getMateriasPrimas(params = {}) {
    const response = await api.get('/materias-primas/', { params })
    return response.data
  }

  /**
   * Obtener una materia prima por ID
   * @param {number} id - ID de la materia prima
   * @returns {Promise} Datos de la materia prima
   */
  async getMateriaPrima(id) {
    const response = await api.get(`/materias-primas/${id}/`)
    return response.data
  }

  /**
   * Crear una nueva materia prima
   * @param {Object} materiaData - Datos de la materia prima
   * @returns {Promise} Materia prima creada
   */
  async createMateriaPrima(materiaData) {
    const response = await api.post('/materias-primas/', materiaData)
    return response.data
  }

  /**
   * Actualizar una materia prima
   * @param {number} id - ID de la materia prima
   * @param {Object} materiaData - Datos actualizados
   * @returns {Promise} Materia prima actualizada
   */
  async updateMateriaPrima(id, materiaData) {
    const response = await api.put(`/materias-primas/${id}/`, materiaData)
    return response.data
  }

  /**
   * Eliminar una materia prima
   * @param {number} id - ID de la materia prima
   * @returns {Promise} Respuesta de eliminación
   */
  async deleteMateriaPrima(id) {
    const response = await api.delete(`/materias-primas/${id}/`)
    return response.data
  }
}

export default new MateriasPrimasService()
