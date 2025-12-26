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
