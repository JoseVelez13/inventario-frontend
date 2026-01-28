import api from "./api"

export default {
  /**
   * Obtener lista de órdenes con paginación
   */
  async getOrdenes(page = 1, pageSize = 20) {
    const res = await api.get("/ordenes-clientes/", {
      params: {
        page,
        page_size: pageSize
      }
    })
    return res.data
  },

  /**
   * Obtener una orden específica por ID
   */
  async getOrden(id) {
    const res = await api.get(`/ordenes-clientes/${id}/`)
    return res.data
  },

  /**
   * Crear nueva orden con items
   */
  async createOrden(data) {
    const res = await api.post("/ordenes-clientes/", data)
    return res.data
  },

  /**
   * Actualizar orden existente
   */
  async updateOrden(id, data) {
    const res = await api.put(`/ordenes-clientes/${id}/`, data)
    return res.data
  },

  /**
   * Eliminar orden
   */
  async deleteOrden(id) {
    const res = await api.delete(`/ordenes-clientes/${id}/`)
    return res.data
  },

  /**
   * Obtener items de una orden
   */
  async getOrdenItems(ordenId) {
    const res = await api.get(`/ordenes-items/?order=${ordenId}`)
    const itemsData = res.data

    // Si los items no incluyen información completa del producto,
    // necesitamos enriquecerlos con la información de productos
    const items = itemsData.results || itemsData || []

    // Obtener información completa de productos para cada item
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        try {
          // Si el item ya incluye información del producto, úsala
          if (item.product_data || item.product_name) {
            return {
              ...item,
              precio_unitario: item.precio_unitario || item.product_data?.price || 0,
              product_nombre: item.product_name || item.product_data?.name || 'Producto no encontrado'
            }
          }

          // Si no, intentar obtener el producto por ID
          if (item.product && typeof item.product === 'number') {
            const ProductosService = (await import('./productosService')).default
            const productoData = await ProductosService.getProducto(item.product)
            return {
              ...item,
              precio_unitario: productoData.price || 0,
              product_nombre: productoData.name || 'Producto no encontrado',
              unit_nombre: productoData.unit?.name || item.unit_nombre || 'N/A'
            }
          }

          return item
        } catch (error) {
          console.warn(`Error obteniendo información del producto ${item.product}:`, error)
          return {
            ...item,
            precio_unitario: 0,
            product_nombre: 'Error al cargar producto'
          }
        }
      })
    )

    return enrichedItems
  },

  /**
   * Crear item en una orden
   */
  async createItem(data) {
    const res = await api.post("/ordenes-items/", data)
    return res.data
  },

  /**
   * Actualizar item
   */
  async updateItem(id, data) {
    const res = await api.put(`/ordenes-items/${id}/`, data)
    return res.data
  },

  /**
   * Eliminar item
   */
  async deleteItem(id) {
    const res = await api.delete(`/ordenes-items/${id}/`)
    return res.data
  }
}