import api from './api'

/**
 * Servicio de autenticación para el sistema Innoquim
 * Maneja JWT tokens (access y refresh)
 */
class AuthService {
  /**
   * Iniciar sesión con username y password
   * @param {string} email - Nombre de usuario o email
   * @param {string} password - Contraseña
   * @returns {Promise} Respuesta del servidor con tokens y datos de usuarios
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login/', {
        email,
        password,
      })

      const { access, refresh, user } = response.data

      // Guardar tokens y usuario en localStorage
      if (access) {
        localStorage.setItem('access_token', access)
      }
      if (refresh) {
        localStorage.setItem('refresh_token', refresh)
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      }

      return response.data
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise} Respuesta del servidor
   */
  async register(userData) {
    try {
      const response = await api.post('/usuarios/', userData)
      return response.data
    } catch (error) {
      console.error('Error en registro:', error)
      throw error
    }
  }

  /**
   * Cerrar sesión y agregar refresh token a blacklist
   * @returns {Promise} Respuesta del servidor
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token')

      // Intentar hacer logout en el servidor (blacklist el refresh token)
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken })
      }
    } catch (error) {
      console.error('Error en logout:', error)
      // Continuar con el logout local aunque falle el servidor
    } finally {
      // Limpiar localStorage
      this.clearAuth()
    }
  }

  /**
   * Limpiar datos de autenticación del localStorage
   */
  clearAuth() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // Emitir evento para que otros componentes sepan del cambio
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'))
    }
  }

  /**
   * Obtener el token de acceso
   * @returns {string|null} Token de acceso o null
   */
  getToken() {
    try {
      return localStorage.getItem('access_token')
    } catch (e) {
      console.warn('No se pudo acceder a localStorage:', e)
      return null
    }
  }

  /**
   * Obtener el refresh token
   * @returns {string|null} Refresh token o null
   */
  getRefreshToken() {
    try {
      return localStorage.getItem('refresh_token')
    } catch (e) {
      console.warn('No se pudo acceder a localStorage:', e)
      return null
    }
  }

  /**
   * Obtener datos del usuario autenticado
   * @returns {Object|null} Objeto con datos del usuario o null
   */
  getUser() {
    try {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (e) {
      console.warn('Error al obtener usuario:', e)
      return null
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} true si está autenticado, false si no
   */
  isAuthenticated() {
    return !!this.getToken()
  }

  /**
   * Obtener información del usuario actual desde el servidor
   * @returns {Promise} Datos actualizados del usuario
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me/')
      const user = response.data

      // Actualizar datos en localStorage
      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error) {
      console.error('Error al obtener usuario actual:', error)
      throw error
    }
  }

  /**
   * Refrescar el token de acceso
   * @returns {Promise} Nuevo access token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()

      if (!refreshToken) {
        throw new Error('No hay refresh token disponible')
      }

      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken,
      })

      const { access } = response.data
      localStorage.setItem('access_token', access)

      return access
    } catch (error) {
      console.error('Error al refrescar token:', error)
      this.clearAuth()
      throw error
    }
  }
}

// Exportar instancia única (singleton)
export default new AuthService()