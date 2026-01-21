// archivoService.js - Servicio para gestión de archivos en Google Drive
import api from './api'
import fileManagerService from './fileManagerService'

const archivoService = {
    /**
     * Obtiene los tipos de reporte disponibles
     */
    async obtenerTiposReporte() {
        try {
            const response = await api.get('/archivos/tipos_reporte/')
            // Se asume que el backend retorna { tipos_reporte: [...] }
            return response.data.tipos_reporte || []
        } catch (error) {
            console.error('Error al obtener tipos de reporte:', error)
            throw error
        }
    },

    /**
     * Sube un archivo a Google Drive
     * @param {File|Blob} archivo - Archivo a subir
     * @param {String} tipoReporte - Tipo de reporte
     * @param {String} descripcion - Descripción opcional
     */
    async subirArchivo(archivo, tipoReporte, descripcion = '') {
        try {
            // Verificar autenticación con file-manager
            if (!fileManagerService.isAuthenticated()) {
                // Obtener URL de autenticación
                const authUrl = await fileManagerService.getAuthUrl()
                
                // Redirigir a autenticación o lanzar error para que el componente maneje la redirección
                const authError = new Error('Autenticación requerida')
                authError.authUrl = authUrl
                authError.needsAuth = true
                throw authError
            }

            // Subir archivo usando file-manager
            const metadata = {
                tipo_reporte: tipoReporte,
                descripcion: descripcion
            }
            
            const response = await fileManagerService.uploadFile(archivo, metadata)
            return response.data
        } catch (error) {
            console.error('Error al subir archivo:', error)
            
            // Si es error de autenticación, propagar el error especial
            if (error.needsAuth) {
                throw error
            }
            
            // Si es error 401 de file-manager, intentar reautenticar
            if (error.response?.status === 401) {
                fileManagerService.logout()
                const authUrl = await fileManagerService.getAuthUrl()
                const authError = new Error('Autenticación requerida')
                authError.authUrl = authUrl
                authError.needsAuth = true
                throw authError
            }
            
            throw error
        }
    },

    /**
     * Compatibilidad hacia atrás: alias de subirArchivo
     */
    async guardarArchivo(archivo, tipoReporte, descripcion = '') {
        return this.subirArchivo(archivo, tipoReporte, descripcion)
    },

    /**
     * Listar archivos con filtros opcionales
     */
    async listarArchivos(filtros = {}) {
        try {
            const params = new URLSearchParams()

            if (filtros.tipo_reporte) {
                params.append('tipo_reporte', filtros.tipo_reporte)
            }

            if (filtros.mis_archivos) {
                params.append('mis_archivos', 'true')
            }

            const response = await api.get(`/archivos/?${params.toString()}`)
            // Se soporta tanto paginado (results) como lista directa
            return response.data.results || response.data || []
        } catch (error) {
            console.error('Error al listar archivos:', error)
            throw error
        }
    },

    /**
     * Obtener un archivo específico por ID
     */
    async obtenerArchivo(archivoId) {
        try {
            const response = await api.get(`/archivos/${archivoId}/`)
            return response.data
        } catch (error) {
            console.error('Error al obtener archivo:', error)
            throw error
        }
    },

    /**
     * Obtener URL de descarga de un archivo
     */
    async obtenerURLDescarga(archivoId) {
        const archivo = await this.obtenerArchivo(archivoId)
        return {
            url_descarga: archivo.url_descarga
        }
    },

    /**
     * Eliminar un archivo
     */
    async eliminarArchivo(archivoId) {
        try {
            const response = await api.delete(`/archivos/${archivoId}/`)
            return response.data
        } catch (error) {
            console.error('Error al eliminar archivo:', error)
            throw error
        }
    }
}

export default archivoService