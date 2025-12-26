import api from './api'

/**
 * Servicio para gestión de productos
 */
class ProductosService {
  /**
   * Obtener lista de productos con paginación y filtros
   * @param {Object} params - Parámetros de consulta (page, page_size, search, ordering)
   * @returns {Promise} Lista paginada de productos
   */
  async getProductos(params = {}) {
    const response = await api.get('/productos/', { params })
    return response.data
  }

  /**
   * Obtener un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise} Datos del producto
   */
  async getProducto(id) {
    const response = await api.get(`/productos/${id}/`)
    return response.data
  }

  /**
   * Crear un nuevo producto
   * @param {Object} productoData - Datos del producto
   * @returns {Promise} Producto creado
   */
  async createProducto(productoData) {
    // Asegurar que los datos tengan el formato correcto
    const cleanData = {
      product_code: String(productoData.product_code),
      name: String(productoData.name),
      description: String(productoData.description),
      unit: Number(productoData.unit), // ID de la unidad (ForeignKey)
      weight: Number(productoData.weight)
    }
    
    console.log('productosService.createProducto - Datos limpios:', cleanData)
    
    const response = await api.post('/productos/', cleanData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  }

  /**
   * Actualizar un producto completo
   * @param {number} id - ID del producto
   * @param {Object} productoData - Datos actualizados
   * @returns {Promise} Producto actualizado
   */
  async updateProducto(id, productoData) {
    const response = await api.put(`/productos/${id}/`, productoData)
    return response.data
  }

  /**
   * Actualizar parcialmente un producto
   * @param {number} id - ID del producto
   * @param {Object} productoData - Datos parciales a actualizar
   * @returns {Promise} Producto actualizado
   */
  async patchProducto(id, productoData) {
    const response = await api.patch(`/productos/${id}/`, productoData)
    return response.data
  }

  /**
   * Eliminar un producto
   * @param {number} id - ID del producto
   * @returns {Promise} Respuesta de eliminación
   */
  async deleteProducto(id) {
    const response = await api.delete(`/productos/${id}/`)
    return response.data
  }

  /**
   * Buscar productos por término
   * @param {string} searchTerm - Término de búsqueda
   * @param {number} page - Número de página
   * @param {number} pageSize - Tamaño de página
   * @returns {Promise} Productos encontrados
   */
  async searchProductos(searchTerm, page = 1, pageSize = 20) {
    return this.getProductos({
      search: searchTerm,
      page,
      page_size: pageSize,
    })
  }

  /**
   * Obtener productos con stock bajo
   * @returns {Promise} Productos con stock por debajo del mínimo
   */
  async getProductosStockBajo() {
    const response = await api.get('/productos', {
      params: { stock_bajo: true },
    })
    return response.data
  }
}

export default new ProductosService()
