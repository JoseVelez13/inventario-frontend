import api from './api'

/**
 * Servicio para gestión de unidades de medida
 */
class UnidadesService {
  /**
   * Obtener lista de todas las unidades
   * @returns {Promise} Lista de unidades
   */
  async getUnidades() {
    const response = await api.get('/unidades/')
    return response.data
  }

  /**
   * Obtener una unidad por ID
   * @param {number} id - ID de la unidad
   * @returns {Promise} Datos de la unidad
   */
  async getUnidad(id) {
    const response = await api.get(`/unidades/${id}/`)
    return response.data
  }

  /**
   * Crear una nueva unidad
   * @param {Object} data - Datos de la unidad
   * @returns {Promise} Unidad creada
   */
  async createUnidad(data) {
    const response = await api.post('/unidades/', data)
    return response.data
  }

  /**
   * Actualizar una unidad
   * @param {number} id - ID de la unidad
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Unidad actualizada
   */
  async updateUnidad(id, data) {
    const response = await api.put(`/unidades/${id}/`, data)
    return response.data
  }

  /**
   * Eliminar una unidad
   * @param {number} id - ID de la unidad
   * @returns {Promise}
   */
  async deleteUnidad(id) {
    const response = await api.delete(`/unidades/${id}/`)
    return response.data
  }

  /**
   * Mapear texto de unidad a ID
   * @param {string} unitText - Texto de la unidad (kg, g, l, etc)
   * @param {Array} unidades - Lista de unidades disponibles
   * @returns {number} ID de la unidad
   */
  mapTextToId(unitText, unidades) {
    const text = String(unitText).toLowerCase().trim()
    
    // Mapeo de variaciones a nombre estándar
    const variations = {
      'kg': ['kg', 'kilogramo', 'kilo', 'kilogramos', 'kilos'],
      'g': ['g', 'gramo', 'gramos', 'gr'],
      'l': ['l', 'litro', 'litros', 'lt'],
      'ml': ['ml', 'mililitro', 'mililitros'],
      'u': ['u', 'unidad', 'unidades', 'pieza', 'piezas'],
      'caja': ['caja', 'cajas'],
      'gal': ['gal', 'galón', 'galon', 'galones'],
      'bbl': ['bbl', 'barril', 'barriles']
    }

    // Buscar en las variaciones
    for (const [standard, vars] of Object.entries(variations)) {
      if (vars.includes(text)) {
        // Buscar en unidades disponibles
        const unit = unidades.find(u => 
          u.symbol?.toLowerCase() === standard || 
          u.name?.toLowerCase() === standard
        )
        if (unit) return unit.id
      }
    }

    // Búsqueda directa por símbolo o nombre
    const unit = unidades.find(u => 
      u.symbol?.toLowerCase() === text || 
      u.name?.toLowerCase() === text
    )
    
    return unit ? unit.id : 2 // Por defecto kg (ID 2)
  }
}

export default new UnidadesService()
