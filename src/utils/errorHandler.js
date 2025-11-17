/**
 * Utilidad para manejar errores del API de forma consistente
 * @param {Error} error - Error de axios
 * @returns {Object} Objeto con mensaje y detalles del error
 */
export const handleApiError = (error) => {
  // Error de red o timeout
  if (!error.response) {
    return {
      message: 'Error de conexión con el servidor. Verifica tu conexión a internet.',
      type: 'network',
      errors: null,
    }
  }

  const { status, data } = error.response

  switch (status) {
    case 400:
      // Bad Request - Errores de validación
      return {
        message: data.detail || 'Datos inválidos. Por favor, revisa los campos.',
        type: 'validation',
        errors: data.errors || data,
      }

    case 401:
      // Unauthorized - No autenticado
      return {
        message: data.detail || 'No autorizado. Por favor, inicia sesión.',
        type: 'unauthorized',
        errors: null,
      }

    case 403:
      // Forbidden - Sin permisos
      return {
        message: data.detail || 'No tienes permisos para realizar esta acción.',
        type: 'forbidden',
        errors: null,
      }

    case 404:
      // Not Found
      return {
        message: data.detail || 'Recurso no encontrado.',
        type: 'not-found',
        errors: null,
      }

    case 422:
      // Unprocessable Entity - Errores de validación (algunos backends)
      return {
        message: 'Error de validación. Verifica los datos enviados.',
        type: 'validation',
        errors: data.errors || data,
      }

    case 500:
      // Internal Server Error
      return {
        message: data.detail || 'Error interno del servidor. Intenta más tarde.',
        type: 'server-error',
        errors: null,
      }

    case 503:
      // Service Unavailable
      return {
        message: 'Servicio no disponible temporalmente. Intenta más tarde.',
        type: 'service-unavailable',
        errors: null,
      }

    default:
      return {
        message: data.detail || `Error desconocido (${status})`,
        type: 'unknown',
        errors: data,
      }
  }
}

/**
 * Formatea errores de validación para mostrarlos en formularios
 * @param {Object} errors - Objeto con errores de validación
 * @returns {Object} Errores formateados por campo
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return {}
  }

  const formatted = {}
  
  for (const [field, messages] of Object.entries(errors)) {
    // Si es un array de mensajes
    if (Array.isArray(messages)) {
      formatted[field] = messages.join('. ')
    } 
    // Si es un string directo
    else if (typeof messages === 'string') {
      formatted[field] = messages
    }
    // Si es un objeto anidado
    else if (typeof messages === 'object') {
      formatted[field] = JSON.stringify(messages)
    }
  }

  return formatted
}

/**
 * Muestra mensaje de error en consola (para debugging)
 * @param {string} context - Contexto donde ocurrió el error
 * @param {Error} error - Error capturado
 */
export const logError = (context, error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.group(`❌ Error en ${context}`)
    console.error('Error:', error)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    console.groupEnd()
  }
}

/**
 * Obtiene un mensaje de error amigable para el usuario
 * @param {Error} error - Error de axios
 * @param {string} defaultMessage - Mensaje por defecto si no se puede determinar
 * @returns {string} Mensaje amigable
 */
export const getErrorMessage = (error, defaultMessage = 'Ocurrió un error inesperado') => {
  const errorInfo = handleApiError(error)
  return errorInfo.message || defaultMessage
}

export default {
  handleApiError,
  formatValidationErrors,
  logError,
  getErrorMessage,
}
