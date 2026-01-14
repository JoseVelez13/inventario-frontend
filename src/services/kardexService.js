import api from './api'

/**
 * Servicio para consulta del Kardex (solo lectura)
 * El Kardex se genera automáticamente al realizar movimientos de inventario
 */
class KardexService {
  /**
   * Obtener lista de movimientos del kardex
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista de movimientos
   */
  async getMovimientos(params = {}) {
    const response = await api.get('/kardex/', { params })
    return response.data
  }

  /**
   * Obtener un movimiento específico por ID
   * @param {number} id - ID del movimiento
   * @returns {Promise} Datos del movimiento
   */
  async getMovimiento(id) {
    const response = await api.get(`/kardex/${id}/`)
    return response.data
  }

  /**
   * Consultar saldo actual de un item en un almacén
   * @param {Object} params - { almacen_id, materia_prima_id o producto_id }
   * @returns {Promise} Saldo actual
   */
  async getSaldo(params) {
    const response = await api.get('/kardex/saldo/', { params })
    return response.data
  }

  /**
   * Ver historial de movimientos de un item específico
   * @param {Object} params - Parámetros de filtrado del historial
   * @returns {Promise} Historial de movimientos
   */
  async getHistorial(params) {
    const response = await api.get('/kardex/historial/', { params })
    return response.data
  }
}

export default new KardexService()
