import axios from 'axios'

const API_URL = 'http://localhost:8000/api/categorias/'

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const categoriasService = {
  // Obtener todas las categorías con paginación
  async getCategorias(page = 1, pageSize = 20) {
    try {
      const response = await axios.get(API_URL, {
        params: { page, page_size: pageSize },
        headers: getAuthHeader()
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener categorías:', error)
      throw error
    }
  },

  // ========== NUEVO MÉTODO ==========
  // Obtener categorías filtradas por tipo
  async getCategoriasByTipo(tipo) {
    try {
      const response = await axios.get(API_URL, {
        params: { tipo: tipo }, // Filtrar por tipo (PRODUCT o RAW_MATERIAL)
        headers: getAuthHeader()
      })
      
      // Si la respuesta tiene paginación, retornar solo los resultados
      if (response.data.results) {
        return response.data.results
      }
      
      // Si es un array directo, retornarlo tal cual
      return response.data
    } catch (error) {
      console.error(`Error al obtener categorías del tipo ${tipo}:`, error)
      throw error
    }
  },

  // Obtener una categoría por ID
  async getCategoria(id) {
    try {
      const response = await axios.get(`${API_URL}${id}/`, {
        headers: getAuthHeader()
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener categoría:', error)
      throw error
    }
  },

  // Crear una nueva categoría
  async createCategoria(data) {
    try {
      const response = await axios.post(API_URL, data, {
        headers: getAuthHeader()
      })
      return response.data
    } catch (error) {
      console.error('Error al crear categoría:', error)
      throw error
    }
  },

  // Actualizar una categoría existente
  async updateCategoria(id, data) {
    try {
      const response = await axios.put(`${API_URL}${id}/`, data, {
        headers: getAuthHeader()
      })
      return response.data
    } catch (error) {
      console.error('Error al actualizar categoría:', error)
      throw error
    }
  },

  // Eliminar una categoría
  async deleteCategoria(id) {
    try {
      const response = await axios.delete(`${API_URL}${id}/`, {
        headers: getAuthHeader()
      })
      return response.data
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      throw error
    }
  }
}

export default categoriasService