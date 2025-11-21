import axios from 'axios'

// Configuración base del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir token JWT automáticamente
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('No se pudo acceder a localStorage:', e)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si hay error 401 y no hemos intentado refresh aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Intentar refrescar el token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh/`,
          { refresh: refreshToken }
        )

        const { access } = response.data
        localStorage.setItem('access_token', access)

        // Reintentar la petición original con el nuevo token
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo y redirigir a login
        console.error('Error al refrescar token:', refreshError)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        // Emitir evento de cambio de autenticación
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-change'))
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
