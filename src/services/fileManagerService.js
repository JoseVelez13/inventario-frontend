import api from './api'
import axios from 'axios'

// Configuración base del File Manager
const FILE_MANAGER_BASE_URL = import.meta.env.VITE_FILE_MANAGER_URL || 'http://localhost:8001'

const fileManagerApi = axios.create({
  baseURL: FILE_MANAGER_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir token de file-manager
fileManagerApi.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('file_manager_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('No se pudo acceder a localStorage:', e)
    }
    return config
  },
  (error) => Promise.reject(error)
)

const fileManagerService = {
  // Obtener URL de autenticación (directo del file-manager)
  async getAuthUrl() {
    try {
      const response = await fileManagerApi.get('/api/auth/url')
      return response.data.auth_url
    } catch (error) {
      console.error('Error al obtener URL de autenticación:', error)
      throw error
    }
  },

  // Manejar callback de autenticación (directo del file-manager)
  async handleAuthCallback(code, state) {
    try {
      console.log('Enviando callback con:', { code, state })
      
      const response = await fileManagerApi.post('/api/auth/callback', {
        code: code,
        state: state
      })
      
      // Guardar token de file-manager
      if (response.data.access_token) {
        localStorage.setItem('file_manager_token', response.data.access_token)
      }
      
      return response.data
    } catch (error) {
      console.error('Error en callback de autenticación:', error)
      console.error('Response data:', error.response?.data)
      console.error('Status:', error.response?.status)
      
      // Extraer mensaje de error del response
      let errorMessage = error.message
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail
        } else if (error.response.data.detail && Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(item => item.msg || item).join(', ')
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      }
      
      throw new Error(`Error ${error.response?.status}: ${errorMessage}`)
    }
  },

  // Subir archivo
  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // Agregar metadata si existe
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key])
      })

      const response = await fileManagerApi.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error al subir archivo:', error)
      
      // Si es error 401, intentar autenticación
      if (error.response?.status === 401) {
        this.logout()
        const authError = new Error('Autenticación requerida')
        authError.needsAuth = true
        throw authError
      }
      
      throw error
    }
  },

  // Verificar si está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('file_manager_token')
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('file_manager_token')
  }
}

export default fileManagerService