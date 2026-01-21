import api from './api'

/**
 * Servicio para gestión de categorías
 * Conecta con /api/categorias/
 */
class CategoriasService {
  /**
   * Obtener lista de categorías
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise} Lista de categorías
   */
  async getCategorias(params = {}) {
    const response = await api.get('/categorias/', { params })
    return response.data
  }

  /**
   * Obtener todas las categorías sin paginación
   * @returns {Promise} Lista de todas las categorías
   */
  async getAll() {
    return this.getCategorias({ page_size: 1000 })
  }

  /**
   * Obtener una categoría por ID
   * @param {number} id - ID de la categoría
   * @returns {Promise} Datos de la categoría
   */
  async getCategoria(id) {
    const response = await api.get(`/categorias/${id}/`)
    return response.data
  }

  /**
   * Crear una nueva categoría
   * @param {Object} data - Datos de la categoría
   * @returns {Promise} Categoría creada
   */
  async createCategoria(data) {
    const response = await api.post('/categorias/', data)
    return response.data
  }

  /**
   * Actualizar una categoría
   * @param {number} id - ID de la categoría
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Categoría actualizada
   */
  async updateCategoria(id, data) {
    const response = await api.put(`/categorias/${id}/`, data)
    return response.data
  }

  /**
   * Eliminar una categoría
   * @param {number} id - ID de la categoría
   * @returns {Promise} Respuesta de eliminación
   */
  async deleteCategoria(id) {
    const response = await api.delete(`/categorias/${id}/`)
    return response.data
  }

  /**
   * Obtener categorías por tipo
   * @param {string} tipo - Tipo de categoría (PRODUCT, RAW_MATERIAL, etc.)
   * @returns {Promise} Categorías filtradas por tipo
   */
  async getCategoriasByTipo(tipo) {
    try {
      const response = await api.get('/categorias/', { params: { tipo } })
      const data = response.data
      
      // Mapear categoria_id a id para compatibilidad con el frontend
      const categorias = Array.isArray(data) ? data : data.results || []
      
      return categorias.map(cat => ({
        ...cat,
        id: cat.categoria_id || cat.id // Usar categoria_id del backend o id si existe
      }))
    } catch (e) {
      console.error('Error en getCategoriasByTipo:', e)
      return []
    }
  }
}

export default new CategoriasService()
