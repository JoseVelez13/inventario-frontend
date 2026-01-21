import axios from 'axios'

const API_URL = 'http://localhost:8000/api/inventario-materiales/'

// Función para obtener el token de autenticación
const getAuthHeader = () => {
    const token = localStorage.getItem('access_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
}

const inventarioMaterialService = {
    // Obtener todos los inventarios con paginación
    async getInventarios(page = 1, pageSize = 20) {
        try {
            const response = await axios.get(API_URL, {
                params: { page, page_size: pageSize },
                headers: getAuthHeader()
            })
            return response.data
        } catch (error) {
            console.error('Error al obtener inventarios:', error)
            throw error
        }
    },

    // Obtener un inventario por ID
    async getInventario(id) {
        try {
            const response = await axios.get(`${API_URL}${id}/`, {
                headers: getAuthHeader()
            })
            return response.data
        } catch (error) {
            console.error('Error al obtener inventario:', error)
            throw error
        }
    },

    // Crear un nuevo inventario
    async createInventario(data) {
        try {
            const response = await axios.post(API_URL, data, {
                headers: getAuthHeader()
            })
            return response.data
        } catch (error) {
            console.error('Error al crear inventario:', error)
            throw error
        }
    },

    // Actualizar un inventario existente
    async updateInventario(id, data) {
        try {
            const response = await axios.put(`${API_URL}${id}/`, data, {
                headers: getAuthHeader()
            })
            return response.data
        } catch (error) {
            console.error('Error al actualizar inventario:', error)
            throw error
        }
    },

    // Eliminar un inventario
    async deleteInventario(id) {
        try {
            const response = await axios.delete(`${API_URL}${id}/`, {
                headers: getAuthHeader()
            })
            return response.data
        } catch (error) {
            console.error('Error al eliminar inventario:', error)
            throw error
        }
    }
}

export default inventarioMaterialService