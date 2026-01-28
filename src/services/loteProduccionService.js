import api from './api'

/**
 * Servicio para gestión de lotes de producción
 * 
 * Un lote de producción es un grupo de unidades del mismo producto
 * producidas en la misma fecha. Cada lote está vinculado a:
 * - Un Producto (qué se está produciendo)
 * - Un Almacén (donde se realiza la producción)
 * - Materiales de Producción (tabla intermedia con Materia Prima usada)
 * - Costos automáticos de materiales y producto
 */
class LoteProduccionService {
  /**
   * Obtener lista de lotes de producción
   * @param {Object} params - Parámetros de búsqueda y paginación
   * @returns {Promise} Lista de lotes
   */
  async getLotesProduccion(params = {}) {
    const response = await api.get('/lotes-produccion/', { params })
    return response.data
  }

  /**
   * Obtener un lote de producción por ID
   * @param {number} id - ID del lote
   * @returns {Promise} Datos del lote con materiales incluidos
   */
  async getLoteProduccion(id) {
    const response = await api.get(`/lotes-produccion/${id}/`)
    return response.data
  }

  /**
   * Crear un nuevo lote de producción
   * @param {Object} loteData - Datos del lote
   * @param {number} loteData.product - ID del producto
   * @param {string} loteData.batch_code - Código único del lote
   * @param {string} loteData.production_date - Fecha de producción (YYYY-MM-DD)
   * @param {number} loteData.produced_quantity - Cantidad producida (decimales permitidos)
   * @param {number} loteData.unit - ID de la unidad
   * @param {number} loteData.almacen - ID del almacén (REQUERIDO)
   * @param {string} loteData.status - Estado (pending, in_progress, completed, cancelled)
   * @param {number} loteData.production_manager - ID del usuario responsable
   * @param {string} loteData.observaciones - Observaciones opcionales
   * @param {Array} loteData.materiales - Array de materiales (opcional en creación)
   * @returns {Promise} Lote creado
   */
  async createLoteProduccion(loteData) {
    const response = await api.post('/lotes-produccion/', loteData)
    return response.data
  }

  /**
   * Actualizar un lote de producción
   * @param {number} id - ID del lote
   * @param {Object} loteData - Datos actualizados
   * @returns {Promise} Lote actualizado
   */
  async updateLoteProduccion(id, loteData) {
    const response = await api.put(`/lotes-produccion/${id}/`, loteData)
    return response.data
  }

  /**
   * Eliminar un lote de producción
   * @param {number} id - ID del lote
   * @returns {Promise}
   */
  async deleteLoteProduccion(id) {
    const response = await api.delete(`/lotes-produccion/${id}/`)
    return response.data
  }

  /**
   * Cambiar el estado de un lote
   * @param {number} id - ID del lote
   * @param {string} status - Nuevo estado (pending, in_progress, completed, cancelled)
   * @returns {Promise} Lote actualizado
   */
  async updateLoteStatus(id, status) {
    const response = await api.patch(`/lotes-produccion/${id}/`, { status })
    return response.data
  }

  /**
   * Completar un lote de producción
   * Ejecuta el proceso completo de producción:
   * - Valida stock de materiales
   * - Descuenta materias primas del inventario
   * - Suma producto terminado al inventario
   * - Registra movimientos en Kardex
   * - Actualiza costos
   * 
   * @param {number} id - ID del lote
   * @returns {Promise} Resultado de la operación
   */
  async completarProduccion(id) {
    const response = await api.post(`/lotes-produccion/${id}/completar/`)
    return response.data
  }

  // ============================================
  // MATERIALES DE PRODUCCIÓN (Tabla Intermedia)
  // ============================================

  /**
   * Obtener materiales usados en un lote
   * @param {number} loteId - ID del lote
   * @returns {Promise} Lista de materiales del lote con costos calculados
   */
  async getMaterialesByLote(loteId) {
    const response = await api.get(`/lotes-produccion/${loteId}/materiales/`)
    return response.data
  }

  /**
   * Agregar un material a un lote de producción
   * El costo_unitario y costo_total se calculan automáticamente
   * 
   * @param {number} loteId - ID del lote
   * @param {Object} materialData - Datos del material
   * @param {number} materialData.raw_material - ID de la materia prima
   * @param {number} materialData.used_quantity - Cantidad usada (hasta 4 decimales)
   * @param {number} materialData.unit - ID de la unidad
   * @returns {Promise} Material creado
   */
  async addMaterialToLote(loteId, materialData) {
    const response = await api.post(
      `/lotes-produccion/${loteId}/materiales/`,
      materialData
    )
    return response.data
  }

  /**
   * Actualizar un material de un lote
   * @param {number} loteId - ID del lote
   * @param {number} materialId - ID del material
   * @param {Object} materialData - Datos actualizados
   * @returns {Promise} Material actualizado
   */
  async updateMaterialInLote(loteId, materialId, materialData) {
    const response = await api.put(
      `/lotes-produccion/${loteId}/materiales/${materialId}/`,
      materialData
    )
    return response.data
  }

  /**
   * Eliminar un material de un lote
   * @param {number} loteId - ID del lote
   * @param {number} materialId - ID del material
   * @returns {Promise}
   */
  async deleteMaterialFromLote(loteId, materialId) {
    const response = await api.delete(
      `/lotes-produccion/${loteId}/materiales/${materialId}/`
    )
    return response.data
  }

  /**
   * Obtener estadísticas de producción
   * @param {Object} params - Filtros (fecha_inicio, fecha_fin, producto_id, estado)
   * @returns {Promise} Estadísticas de lotes
   */
  async getEstadisticasProduccion(params = {}) {
    const response = await api.get('/lotes-produccion/estadisticas/', { params })
    return response.data
  }
}

export default new LoteProduccionService()