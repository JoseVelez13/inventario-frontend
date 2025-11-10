import api from './api'

/**
 * Servicio para gestión de inventario
 */
class InventarioService {
  /**
   * Obtener inventario de materiales
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de inventario de materiales
   */
  async getInventarioMateriales(params = {}) {
    const response = await api.get('/inventario/materiales', { params })
    return response.data
  }

  /**
   * Obtener inventario de productos
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de inventario de productos
   */
  async getInventarioProductos(params = {}) {
    const response = await api.get('/inventario/productos', { params })
    return response.data
  }

  /**
   * Obtener movimientos de inventario
   * @param {Object} params - Parámetros de consulta (fechas, tipo, etc.)
   * @returns {Promise} Lista de movimientos
   */
  async getMovimientos(params = {}) {
    const response = await api.get('/inventario/movimientos', { params })
    return response.data
  }

  /**
   * Registrar entrada de inventario
   * @param {Object} entradaData - Datos de la entrada
   * @returns {Promise} Entrada registrada
   */
  async registrarEntrada(entradaData) {
    const response = await api.post('/inventario/entrada', entradaData)
    return response.data
  }

  /**
   * Registrar salida de inventario
   * @param {Object} salidaData - Datos de la salida
   * @returns {Promise} Salida registrada
   */
  async registrarSalida(salidaData) {
    const response = await api.post('/inventario/salida', salidaData)
    return response.data
  }

  /**
   * Obtener historial de un producto/material
   * @param {string} tipo - Tipo (producto o material)
   * @param {number} id - ID del producto/material
   * @returns {Promise} Historial de movimientos
   */
  async getHistorial(tipo, id) {
    const response = await api.get(`/inventario/historial/${tipo}/${id}`)
    return response.data
  }
}

export default new InventarioService()
