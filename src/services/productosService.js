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
   * Alias para obtener todos los productos (compatibilidad con Dashboard)
   * @returns {Promise} Lista de todos los productos
   */
  async getAll() {
    return this.getProductos({ page_size: 1000 })
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
      categoria_id: Number(productoData.categoria_id), // ID de la categoría (ForeignKey - OBLIGATORIO)
      unit: Number(productoData.unit), // ID de la unidad (ForeignKey)
      weight: Number(productoData.weight),
      stock: Number(productoData.stock || 0)
    }
    
    console.log('productosService.createProducto - Datos limpios:', cleanData)
    
    try {
      const response = await api.post('/productos/', cleanData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error detallado del backend:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      })
      throw error
    }
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

  /**
   * Obtener todos los productos para verificar notificaciones
   * @returns {Promise} Todos los productos
   */
  async getAllProductos() {
    let allProducts = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await this.getProductos({ page, page_size: 100 })
      
      if (response.results) {
        allProducts = allProducts.concat(response.results)
        hasMore = !!response.next
        page++
      } else if (Array.isArray(response)) {
        allProducts = response
        hasMore = false
      } else {
        hasMore = false
      }
    }

    return allProducts
  }
}

export default new ProductosService()
