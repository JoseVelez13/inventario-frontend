import api from './api'

/**
 * Servicio para el dashboard y estadísticas
 */
class DashboardService {
  /**
   * Obtener estadísticas generales del dashboard
   * @returns {Promise} Objeto con estadísticas del sistema
   */
  async getEstadisticas() {
    const response = await api.get('/dashboard/estadisticas')
    return response.data
  }

  /**
   * Obtener reporte de inventario
   * @param {Object} params - Parámetros del reporte (fechas, filtros)
   * @returns {Promise} Datos del reporte de inventario
   */
  async getReporteInventario(params = {}) {
    const response = await api.get('/reportes/inventario', { params })
    return response.data
  }

  /**
   * Obtener reporte de ventas
   * @param {Object} params - Parámetros del reporte (fechas, filtros)
   * @returns {Promise} Datos del reporte de ventas
   */
  async getReporteVentas(params = {}) {
    const response = await api.get('/reportes/ventas', { params })
    return response.data
  }

  /**
   * Obtener alertas del sistema
   * @returns {Promise} Lista de alertas (stock bajo, órdenes pendientes, etc.)
   */
  async getAlertas() {
    const response = await api.get('/dashboard/alertas')
    return response.data
  }

  /**
   * Obtener actividad reciente
   * @param {number} limit - Número máximo de registros
   * @returns {Promise} Lista de actividades recientes
   */
  async getActividadReciente(limit = 10) {
    const response = await api.get('/dashboard/actividad', {
      params: { limit },
    })
    return response.data
  }
}

export default new DashboardService()
