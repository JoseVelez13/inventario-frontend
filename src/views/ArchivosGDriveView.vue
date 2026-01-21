<template>
    <div>
        <!-- HEADER GLOBAL -->
        <HeaderGlobal />

        <div class="page-container">
            <!-- Barra superior -->
            <div class="topbar">
                <div>
                    <h1 class="topbar-title">
                        <i class="fa-brands fa-google-drive"></i>
                        Archivos en Drive
                        <span class="chip" :class="{ loading: cargando }">{{ totalArchivos }}</span>
                    </h1>
                </div>
                <div class="topbar-actions">
                    <button class="btn-secondary" @click="cargarArchivos">
                        <i class="fa-solid fa-arrows-rotate"></i> Refrescar
                    </button>
                </div>
            </div>

            <!-- Contenedor principal -->
            <div class="content-box">
                <div class="content-body">

                    <!-- Barra de búsqueda y filtros -->
                    <div class="search-bar">
                        <input v-model="busqueda" type="text" class="search-input"
                            placeholder="🔍 Buscar por nombre de archivo..." @input="filtrarArchivos">

                        <select v-model="filtroTipo" class="search-input" style="flex: 0 0 200px"
                            @change="cargarArchivos">
                            <option value="">Todos los tipos</option>
                            <option value="inventario">Inventario</option>
                            <option value="clientes">Clientes</option>
                            <option value="proveedores">Proveedores</option>
                            <option value="pedidos">Pedidos</option>
                            <option value="materias_primas">Materias Primas</option>
                            <option value="ordenes">Ordenes</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <!-- Estado de carga -->
                    <div v-if="cargando" class="loading-state">
                        <i class="fa-solid fa-spinner fa-spin"></i> Cargando archivos...
                    </div>

                    <!-- Mensaje de error -->
                    <div v-else-if="error" class="alert-error">
                        <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
                    </div>

                    <!-- Estado vacío -->
                    <div v-else-if="archivosFiltrados.length === 0" class="empty-state">
                        <div class="empty-icon">
                            <i class="fa-brands fa-google-drive"></i>
                        </div>
                        <h3>No hay archivos guardados</h3>
                        <p>Los archivos que exportes se guardarán aquí automáticamente</p>
                    </div>

                    <!-- Tabla de archivos -->
                    <table v-else class="table">
                        <thead>
                            <tr>
                                <th><i class="fa-solid fa-file"></i> Archivo</th>
                                <th>Tipo</th>
                                <th>Tamaño</th>
                                <th>Subido por</th>
                                <th>Fecha</th>
                                <th style="text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="archivo in paginatedData" :key="archivo.archivo_id">
                                <td class="h">
                                    <i class="fa-solid fa-file-pdf" style="color: #ef4444; margin-right: 8px;"></i>
                                    {{ archivo.nombre }}
                                </td>
                                <td>
                                    <span class="badge-tipo" :class="'tipo-' + archivo.tipo_reporte">
                                        {{ formatearTipo(archivo.tipo_reporte) }}
                                    </span>
                                </td>
                                <td>{{ archivo.tamaño_legible }}</td>
                                <td>{{ archivo.usuario_generador_nombre || 'Desconocido' }}</td>
                                <td>{{ formatearFecha(archivo.fecha_generacion) }}</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-icon btn-download" @click="descargarArchivo(archivo)"
                                            title="Descargar">
                                            <i class="fa-solid fa-download"></i>
                                        </button>
                                        <button v-if="puedeEliminar(archivo)" class="btn-icon btn-delete"
                                            @click="confirmarEliminar(archivo)" title="Eliminar">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="archivosFiltrados.length > 0" class="pagination-container">
                        <div class="pagination-info">
                            <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalArchivos }} archivos</span>
                        </div>
                        <div class="pagination-controls">
                            <button class="btn-secondary" @click="previousPage" :disabled="currentPage === 1">
                                ← Anterior
                            </button>
                            <div class="page-indicator">
                                <label for="page-input">Página:</label>
                                <input id="page-input" v-model.number="currentPage" @change="goToPage" type="number"
                                    :min="1" :max="totalPages" class="page-input" />
                                <span>de {{ totalPages }}</span>
                            </div>
                            <button class="btn-secondary" @click="nextPage"
                                :disabled="currentPage === totalPages || totalPages === 0">
                                Siguiente →
                            </button>
                        </div>
                        <div class="pagination-size">
                            <label for="page-size-select">Items por página:</label>
                            <select v-model.number="pageSize" @change="changePageSize" id="page-size-select"
                                class="page-size-select">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de confirmación de eliminación -->
            <ConfirmDialog v-if="mostrarConfirmacion" :show="mostrarConfirmacion"
                :titulo="`¿Eliminar ${archivoSeleccionado?.nombre}?`"
                mensaje="Esta acción no se puede deshacer. El archivo se eliminará de Google Drive permanentemente."
                @confirm="eliminarArchivo" @cancel="cancelarEliminar" />
            <!-- Modal de éxito -->
            <div v-if="mostrarExito" class="modal-overlay" @click="mostrarExito = false">
                <div class="modal-content" @click.stop>
                    <div class="modal-icon success">
                        <i class="fa-solid fa-check"></i>
                    </div>
                    <h3>{{ mensajeNotificacion }}</h3>
                    <div class="modal-actions">
                        <button @click="mostrarExito = false" class="btn-ok">
                            OK
                        </button>
                    </div>
                </div>
            </div>

            <!-- Modal de error -->
            <div v-if="mostrarError" class="modal-overlay" @click="mostrarError = false">
                <div class="modal-content" @click.stop>
                    <div class="modal-icon error">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                    <h3>{{ mensajeNotificacion }}</h3>
                    <div class="modal-actions">
                        <button @click="mostrarError = false" class="btn-ok">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import archivoService from '@/services/archivoService';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import HeaderGlobal from '@/components/HeaderGlobal.vue';

export default {
    name: 'ArchivosGDriveView',
    components: {
        ConfirmDialog,
        HeaderGlobal
    },
    data() {
        return {
            archivos: [],
            archivosFiltrados: [],
            busqueda: '',
            filtroTipo: '',
            cargando: false,
            error: null,
            mostrarConfirmacion: false,
            archivoSeleccionado: null,
            mostrarExito: false,
            mostrarError: false,
            mensajeNotificacion: '',
            currentPage: 1,
            pageSize: 20,
            sortField: null,
            sortOrder: 'asc'
        };
    },
    computed: {
        totalArchivos() {
            return this.archivosFiltrados.length;
        },
        usuarioActual() {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                return user?.username || null;
            } catch {
                return null;
            }
        }
    },
    computed: {
        totalArchivos() {
            return this.archivosFiltrados.length;
        },
        usuarioActual() {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                return user?.username || null;
            } catch {
                return null;
            }
        },
        sortedAndFiltered() {
            const data = [...this.archivosFiltrados];

            if (!this.sortField) {
                return data;
            }

            return data.sort((a, b) => {
                let aVal = a[this.sortField];
                let bVal = b[this.sortField];

                if (aVal === null || aVal === undefined) aVal = '';
                if (bVal === null || bVal === undefined) bVal = '';

                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();

                if (this.sortOrder === 'asc') {
                    return aStr.localeCompare(bStr, 'es', { numeric: true });
                } else {
                    return bStr.localeCompare(aStr, 'es', { numeric: true });
                }
            });
        },

        paginatedData() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.sortedAndFiltered.slice(start, end);
        },

        totalPages() {
            return Math.ceil(this.archivosFiltrados.length / this.pageSize);
        },

        startItem() {
            return this.archivosFiltrados.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
        },

        endItem() {
            return Math.min(this.currentPage * this.pageSize, this.archivosFiltrados.length);
        }
    },
    mounted() {
        this.cargarArchivos();
    },
    methods: {
        async cargarArchivos() {
            this.cargando = true;
            this.error = null;

            try {
                const filtros = {};
                if (this.filtroTipo) {
                    filtros.tipo_reporte = this.filtroTipo;
                }

                this.archivos = await archivoService.listarArchivos(filtros);
                this.filtrarArchivos();
            } catch (error) {
                console.error('Error al cargar archivos:', error);
                this.error = 'Error al cargar los archivos. Intente nuevamente.';
            } finally {
                this.cargando = false;
            }
        },

        filtrarArchivos() {
            let resultado = [...this.archivos];

            if (this.busqueda.trim()) {
                const busquedaLower = this.busqueda.toLowerCase();
                resultado = resultado.filter(archivo =>
                    archivo.nombre.toLowerCase().includes(busquedaLower) ||
                    archivo.descripcion?.toLowerCase().includes(busquedaLower)
                );
            }

            this.archivosFiltrados = resultado;
        },

        puedeEliminar(archivo) {
            return archivo.usuario_generador_nombre === this.usuarioActual;
        },

        async descargarArchivo(archivo) {
            try {
                // Obtener la URL de descarga del backend
                const response = await fetch(`http://localhost:8000/api/archivos/${archivo.archivo_id}/download/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    }
                });

                if (!response.ok) throw new Error('Error al obtener URL');

                const data = await response.json();

                // Usar fetch para descargar el archivo directamente
                const fileResponse = await fetch(data.url_descarga);
                const blob = await fileResponse.blob();

                // Crear URL del blob y descargar
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = archivo.nombre || 'archivo.pdf';
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();

                // Limpiar
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(blobUrl);
                }, 100);

            } catch (error) {
                console.error('Error al descargar:', error);

                // Si falla el método directo, intentar con iframe invisible
                try {
                    const response = await fetch(`http://localhost:8000/api/archivos/${archivo.archivo_id}/download/`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                    });
                    const data = await response.json();

                    // Crear iframe invisible para descarga
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = data.url_descarga;
                    document.body.appendChild(iframe);

                    setTimeout(() => {
                        document.body.removeChild(iframe);
                    }, 5000);

                } catch (err) {
                    alert('Error al descargar el archivo. Intente nuevamente.');
                }
            }
        },

        confirmarEliminar(archivo) {
            this.archivoSeleccionado = archivo;
            this.mostrarConfirmacion = true;
        },

        cancelarEliminar() {
            this.mostrarConfirmacion = false;
            this.archivoSeleccionado = null;
        },

        async eliminarArchivo() {
            try {
                await archivoService.eliminarArchivo(this.archivoSeleccionado.archivo_id);
                await this.cargarArchivos();

                this.mostrarConfirmacion = false;
                this.archivoSeleccionado = null;

                this.mensajeNotificacion = mensajeError;
                this.mostrarError = true;
            } catch (error) {
                console.error('Error al eliminar:', error);
                const mensajeError = error.response?.data?.error || error.response?.data?.detail || 'Error al eliminar el archivo';
            }
        },

        formatearTipo(tipo) {
            const tipos = {
                'inventario': 'Inventario',
                'clientes': 'Clientes',
                'proveedores': 'Proveedores',
                'pedidos': 'Pedidos',
                'materias_primas': 'Materias Primas',
                'ordenes': 'Ordenes',
                'otro': 'Otro'
            };
            return tipos[tipo] || tipo;
        },

        formatearFecha(fecha) {
            if (!fecha) return '-';
            const date = new Date(fecha);
            const ahora = new Date();
            const diff = ahora - date;
            const minutos = Math.floor(diff / 60000);
            const horas = Math.floor(diff / 3600000);
            const dias = Math.floor(diff / 86400000);

            if (minutos < 60) return `Hace ${minutos} min`;
            if (horas < 24) return `Hace ${horas}h`;
            if (dias < 7) return `Hace ${dias} días`;

            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        },
        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        goToPage() {
            if (this.currentPage < 1) {
                this.currentPage = 1;
            } else if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages;
            }
        },

        changePageSize() {
            this.currentPage = 1;
        },

        toggleSort(field) {
            if (this.sortField === field) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortField = field;
                this.sortOrder = 'asc';
            }
        }
    }
};
</script>

<style scoped>
.page-container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #EEF3F9, #F8FAFC);
    display: flex;
    flex-direction: column;
}

.topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 32px;
    margin: 24px auto 20px;
    width: 95%;
    max-width: 1200px;
    background: var(--color-card, #ffffff);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--color-border, #E5E7EB);
}

.topbar-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text, #374151);
    font-family: 'Inter', 'Roboto', sans-serif;
    letter-spacing: -0.3px;
}

.chip {
    display: inline-block;
    margin-left: 10px;
    background: var(--color-primary, #4F6F8F);
    color: #fff;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    min-width: 28px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chip.loading {
    background: #9CA3AF;
    opacity: 0.9;
}

.topbar-actions {
    display: flex;
    gap: 12px;
}

.btn-primary {
    background: var(--color-primary, #4F6F8F);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(79, 111, 143, 0.2);
}

.btn-primary:hover {
    background: var(--color-primary-light, #6B8CAE);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(79, 111, 143, 0.3);
}

.btn-secondary {
    background: var(--color-bg, #F9FAFB);
    color: var(--color-text, #374151);
    border: 1px solid var(--color-border, #E5E7EB);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: var(--color-bg-secondary, #F3F4F6);
    border-color: var(--color-primary, #4F6F8F);
}

.btn-secondary.active {
    background: var(--color-primary, #4F6F8F);
    color: white;
    border-color: var(--color-primary, #4F6F8F);
}

.content-box {
    width: 95%;
    max-width: 1200px;
    margin: 0 auto 40px;
    background: var(--color-card, #ffffff);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--color-border, #E5E7EB);
    overflow: hidden;
}

.content-body {
    padding: 24px;
}

.search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;
}

.search-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid var(--color-border, #E5E7EB);
    border-radius: 8px;
    font-size: 14px;
    color: var(--color-text, #374151);
    background: var(--color-card, #ffffff);
    transition: all 0.2s ease;
    outline: none;
}

.search-input:focus {
    border-color: var(--color-primary, #4F6F8F);
    box-shadow: 0 0 0 3px rgba(79, 111, 143, 0.1);
}

.search-input::placeholder {
    color: #9CA3AF;
}

.table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
}

.table th,
.table td {
    padding: 14px 12px;
    border-bottom: 1px solid var(--color-border, #E5E7EB);
    text-align: left;
    font-size: 14px;
}

.table thead th {
    background: var(--color-bg, #F9FAFB);
    color: var(--color-text, #374151);
    font-weight: 600;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table tbody tr {
    transition: background 0.15s ease;
}

.table tbody tr:hover {
    background: var(--color-bg, #F9FAFB);
}

.table tbody td {
    color: var(--color-text, #374151);
}

.table tbody td.h {
    font-weight: 400;
}

.loading-state {
    padding: 20px;
    text-align: center;
    color: var(--color-text-secondary, #6B7280);
    font-size: 14px;
}

.alert-error {
    padding: 12px 16px;
    border: 1px solid #FCA5A5;
    background: #FEF2F2;
    color: #DC2626;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--color-text-secondary, #6B7280);
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-state h3 {
    font-size: 18px;
    color: var(--color-text, #374151);
    margin-bottom: 8px;
    font-weight: 600;
}

.empty-state p {
    font-size: 14px;
    margin-bottom: 24px;
}

.action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
}

.btn-icon {
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-icon:hover {
    background: rgba(79, 111, 143, 0.08);
    transform: scale(1.1);
}

.btn-download {
    color: #10B981;
}

.btn-download:hover {
    background: rgba(16, 185, 129, 0.1);
}

.btn-delete {
    color: #EF4444;
}

.btn-delete:hover {
    background: rgba(244, 67, 54, 0.1);
}

.btn-icon:active {
    transform: scale(0.95);
}

.btn-icon:focus,
.btn-icon:focus-visible {
    outline: none;
    box-shadow: none;
}

button:focus,
button:focus-visible {
    outline: none;
}

.btn-secondary:focus,
.btn-secondary:focus-visible {
    outline: none;
}

.badge-tipo {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
}

.tipo-inventario {
    background: #DBEAFE;
    color: #1E40AF;
}

.tipo-clientes {
    background: #D1FAE5;
    color: #059669;
}

.tipo-proveedores {
    background: #FEF3C7;
    color: #D97706;
}

.tipo-pedidos {
    background: #FCE7F3;
    color: #BE185D;
}

.tipo-materias_primas {
    background: #E0E7FF;
    color: #4F46E5;
}

.tipo-ordenes {
    background: #CCFBF1;
    color: #0F766E;
}

.tipo-otro {
    background: #F3F4F6;
    color: #4B5563;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-content {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-size: 40px;
    color: white;
}

.modal-icon.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.modal-icon.error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
}

.modal-content h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 24px;
    line-height: 1.4;
}

.modal-actions {
    display: flex;
    justify-content: center;
}

.btn-ok {
    padding: 12px 40px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background: linear-gradient(135deg, #4F6F8F 0%, #6B8CAE 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(79, 111, 143, 0.3);
}

.btn-ok:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 111, 143, 0.4);
}

.btn-ok:active {
    transform: translateY(0);
}

.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border, #E5E7EB);
    gap: 16px;
    flex-wrap: wrap;
}

.pagination-info {
    color: var(--color-text-secondary, #6B7280);
    font-size: 14px;
    font-weight: 500;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--color-text, #374151);
}

.page-input {
    width: 60px;
    padding: 6px 8px;
    border: 1px solid var(--color-border, #E5E7EB);
    border-radius: 6px;
    text-align: center;
    font-size: 14px;
}

.page-input:focus {
    outline: none;
    border-color: var(--color-primary, #4F6F8F);
}

.pagination-size {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--color-text, #374151);
}

.page-size-select {
    padding: 6px 10px;
    border: 1px solid var(--color-border, #E5E7EB);
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    background: white;
}

.page-size-select:focus {
    outline: none;
    border-color: var(--color-primary, #4F6F8F);
}

.btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@media (max-width: 860px) {
    .topbar {
        width: 96%;
    }

    .content-box {
        width: 96%;
    }

    .search-bar {
        flex-direction: column;
    }

    .search-input {
        width: 100%;
    }
    .pagination-container {
        flex-direction: column;
        align-items: stretch;
    }

    .pagination-controls {
        justify-content: center;
    }

    .pagination-size {
        justify-content: center;
    }
}
</style>