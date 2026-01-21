<template>
    <div class="page-container">
        <HeaderGlobal />
        <Breadcrumbs />
        <div class="bg-fondo-clientes"></div>

        <div class="topbar">
            <div class="topbar-title">
                Órdenes de Cliente
                <span class="chip" aria-live="polite" title="Total de órdenes">
                    <template v-if="!cargando">{{ totalOrdenes }}</template>
                    <template v-else>...</template>
                </span>
            </div>
            <div class="topbar-actions">
                <Tooltip text="Volver a la página anterior">
                    <button class="btn-secondary" @click="$router.back()">Atrás</button>
                </Tooltip>
                <Tooltip text="Recargar lista de órdenes">
                    <button class="btn-secondary" @click="reload">Refrescar</button>
                </Tooltip>
                <Tooltip text="Importar órdenes desde archivo">
                    <button class="btn-secondary" @click="openImport">📥 Importar</button>
                </Tooltip>
                <Tooltip text="Exportar órdenes a archivo">
                    <button class="btn-secondary" @click="openExport">📤 Exportar</button>
                </Tooltip>
                <Tooltip text="Crear una nueva orden">
                    <button class="btn-primary" @click="openCreateModal">Nuevo</button>
                </Tooltip>
            </div>
        </div>

        <div class="content-box">
            <div class="content-body">
                <!-- Barra de búsqueda y filtros -->
                <div class="search-bar">
                    <input v-model="busqueda" @input="onSearch" type="text" placeholder="Buscar por código, cliente..."
                        class="search-input" />
                    <select v-model="filtroEstado" class="search-input" style="flex: 0 0 200px" @change="onSearch">
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="in_progress">En Proceso</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>
                    <button class="btn-secondary" @click="clearSearch">Limpiar</button>
                </div>

                <!-- Estado de carga -->
                <div v-if="cargando" class="loading-state">Cargando órdenes...</div>

                <!-- Mensaje de error -->
                <div v-else-if="error" class="alert-error">{{ error }}</div>

                <!-- Estado vacío -->
                <div v-else-if="ordenes.length === 0" class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No hay órdenes registradas</h3>
                    <p>Comienza creando tu primera orden de cliente</p>
                </div>

                <!-- Tabla de órdenes -->
                <table v-else class="table">
                    <thead>
                        <tr>
                            <th class="sortable-header" @click="toggleSort('order_code')">
                                <div class="header-content">
                                    <span>Código</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'order_code' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'order_code' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('client_nombre')">
                                <div class="header-content">
                                    <span>Cliente</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'client_nombre' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'client_nombre' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('order_date')">
                                <div class="header-content">
                                    <span>Fecha</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'order_date' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'order_date' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('status')">
                                <div class="header-content">
                                    <span>Estado</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'status' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'status' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('tax_rate')">
                                <div class="header-content">
                                    <span>Impuesto (%)</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'tax_rate' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'tax_rate' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('tax_amount')">
                                <div class="header-content">
                                    <span>Monto Impuesto</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'tax_amount' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'tax_amount' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('total_amount')">
                                <div class="header-content">
                                    <span>Total</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'total_amount' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'total_amount' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th style="width:100px; text-align:center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="orden in paginatedData" :key="orden.id">
                            <td class="h">{{ orden.order_code }}</td>
                            <td class="h">{{ orden.client_nombre || '-' }}</td>
                            <td class="h">{{ formatearFecha(orden.order_date) }}</td>
                            <td>
                                <span class="badge-estado" :class="'estado-' + orden.status">
                                    {{ formatearEstado(orden.status) }}
                                </span>
                            </td>
                            <td class="h">{{ orden.tax_rate }}%</td>
                            <td class="h">${{ formatearMonto(orden.tax_amount) }}</td>
                            <td class="h"><strong>${{ formatearMonto(orden.total_amount) }}</strong></td>
                            <td class="action-buttons">
                                <Tooltip text="Ver detalle">
                                    <button class="btn-icon btn-view" @click="verDetalle(orden)">👁️</button>
                                </Tooltip>
                                <Tooltip text="Editar orden">
                                    <button class="btn-icon btn-edit" @click="openEditModal(orden.id)">✏️</button>
                                </Tooltip>
                                <Tooltip text="Eliminar orden">
                                    <button class="btn-icon btn-delete" @click="confirmarEliminar(orden)">🗑️</button>
                                </Tooltip>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Paginación -->
                <div v-if="ordenes.length > 0" class="pagination-container">
                    <div class="pagination-info">
                        <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalOrdenes }} órdenes</span>
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

        <!-- Modal de confirmación -->
        <ConfirmDialog :show="confirmDialog.show" :title="confirmDialog.title" :message="confirmDialog.message"
            @confirm="onConfirmDelete" @cancel="confirmDialog.show = false" />

        <!-- Importar/Exportar -->
        <ImportExportDialog :show="importExportDialog.show" :mode="importExportDialog.mode" :data="ordenes"
            :columns="exportColumns" :item-count="totalOrdenes" entity-name="Órdenes" :api-endpoint="apiEndpoint"
            @close="importExportDialog.show = false" @import-complete="handleImportComplete" />

        <!-- Notificaciones -->
        <Notification :show="notification.show" :message="notification.message" :type="notification.type"
            @close="notification.show = false" />

        <!-- Modal de formulario -->
        <OrdenClienteFormModal :show="showFormModal" :edit-id="formEditId" @close="onModalClose"
            @saved="onModalSaved" />
    </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import Notification from '../components/Notification.vue'
import OrdenClienteFormModal from '../components/OrdenClienteFormModal.vue'
import ordenClienteService from '../services/ordenClienteService'
import '../assets/styles/Clientes.css'

export default {
    name: 'OrdenesClienteListView',
    components: {
        HeaderGlobal,
        Breadcrumbs,
        Tooltip,
        ConfirmDialog,
        ImportExportDialog,
        Notification,
        OrdenClienteFormModal
    },
    data() {
        return {
            ordenes: [],
            allOrdenes: [],
            busqueda: '',
            filtroEstado: '',
            cargando: false,
            error: null,
            sortField: null,
            sortOrder: 'asc',
            currentPage: 1,
            pageSize: 20,
            confirmDialog: {
                show: false,
                title: '¿Eliminar orden?',
                message: 'Esta acción no se puede deshacer. Se eliminarán todos los items asociados.',
                ordenId: null
            },
            importExportDialog: { show: false, mode: 'export' },
            apiEndpoint: 'http://localhost:8000/api/ordenes-cliente/',
            exportColumns: [
                { key: 'id', label: 'ID' },
                { key: 'order_code', label: 'Código' },
                { key: 'client_nombre', label: 'Cliente' },
                { key: 'order_date', label: 'Fecha' },
                { key: 'status', label: 'Estado' },
                { key: 'tax_rate', label: 'Tasa Impuesto (%)' },
                { key: 'tax_amount', label: 'Monto Impuesto' },
                { key: 'total_amount', label: 'Total' },
                { key: 'notes', label: 'Notas' }
            ],
            notification: {
                show: false,
                message: '',
                type: 'success'
            },
            showFormModal: false,
            formEditId: null
        }
    },

    created() {
        this.cargarOrdenes()
    },

    computed: {
        // Obtener órdenes filtradas por búsqueda y estado (de TODAS las órdenes)
        filtered() {
            let resultado = [...this.allOrdenes]

            if (this.filtroEstado) {
                resultado = resultado.filter(o => o.status === this.filtroEstado)
            }

            if (this.busqueda.trim()) {
                const term = this.busqueda.toLowerCase()
                resultado = resultado.filter(o =>
                    (o.order_code && o.order_code.toLowerCase().includes(term)) ||
                    (o.client_nombre && o.client_nombre.toLowerCase().includes(term)) ||
                    (o.notes && o.notes.toLowerCase().includes(term))
                )
            }

            return resultado
        },

        // Ordenar los datos filtrados
        sortedAndFiltered() {
            const data = [...this.filtered]

            if (!this.sortField) {
                return data
            }

            return data.sort((a, b) => {
                let aVal = a[this.sortField]
                let bVal = b[this.sortField]

                if (aVal === null || aVal === undefined) aVal = ''
                if (bVal === null || bVal === undefined) bVal = ''

                // Ordenamiento numérico para campos específicos
                if (['tax_rate', 'tax_amount', 'total_amount'].includes(this.sortField)) {
                    aVal = Number(aVal) || 0
                    bVal = Number(bVal) || 0
                    return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                }

                // Ordenamiento por fecha
                if (this.sortField === 'order_date') {
                    const dateA = new Date(aVal)
                    const dateB = new Date(bVal)
                    return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA
                }

                // Ordenamiento alfabético para el resto
                const aStr = String(aVal).toLowerCase()
                const bStr = String(bVal).toLowerCase()

                if (this.sortOrder === 'asc') {
                    return aStr.localeCompare(bStr, 'es', { numeric: true })
                } else {
                    return bStr.localeCompare(aStr, 'es', { numeric: true })
                }
            })
        },

        // Aplicar paginación a los datos ordenados y filtrados
        paginatedData() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.sortedAndFiltered.slice(start, end)
        },

        // Actualizar total basado en datos filtrados
        totalFiltered() {
            return this.filtered.length
        },

        totalOrdenes() {
            return this.totalFiltered
        },

        totalPages() {
            return Math.ceil(this.totalFiltered / this.pageSize)
        },

        startItem() {
            return this.totalFiltered === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1
        },

        endItem() {
            return Math.min(this.currentPage * this.pageSize, this.totalFiltered)
        }
    },

    methods: {
        toggleSort(field) {
            if (this.sortField === field) {
                this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
            } else {
                this.sortField = field
                this.sortOrder = 'asc'
            }
        },

        async cargarOrdenes() {
            this.cargando = true
            this.error = null

            try {
                let allData = []
                let page = 1
                let hasMore = true

                while (hasMore) {
                    const response = await ordenClienteService.getOrdenes(page, 100)

                    if (response.results) {
                        allData = allData.concat(response.results)
                        hasMore = !!response.next
                        page++
                    } else {
                        allData = Array.isArray(response) ? response : []
                        hasMore = false
                    }
                }

                this.allOrdenes = allData
                this.ordenes = allData
                this.currentPage = 1
            } catch (error) {
                console.error('Error al cargar órdenes:', error)
                this.error = 'No se pudo cargar la lista de órdenes.'
            } finally {
                this.cargando = false
            }
        },

        onSearch() {
            this.currentPage = 1
        },

        clearSearch() {
            this.busqueda = ''
            this.filtroEstado = ''
            this.$nextTick(() => {
                const searchInput = document.querySelector('.search-input')
                if (searchInput) {
                    searchInput.focus()
                }
            })
        },

        reload() {
            this.currentPage = 1
            this.cargarOrdenes()
        },

        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++
            }
        },

        goToPage() {
            if (this.currentPage < 1) {
                this.currentPage = 1
            } else if (this.currentPage > this.totalPages) {
                this.currentPage = this.totalPages
            }
        },

        changePageSize() {
            this.currentPage = 1
        },

        openImport() {
            this.importExportDialog = { show: true, mode: 'import' }
        },

        openExport() {
            this.importExportDialog = { show: true, mode: 'export' }
        },

        openCreateModal() {
            this.formEditId = null
            this.showFormModal = true
        },

        openEditModal(id) {
            this.formEditId = id
            this.showFormModal = true
        },

        verDetalle(orden) {
            this.$router.push({ name: 'orden-detalle', params: { id: orden.id } })
        },

        confirmarEliminar(orden) {
            this.confirmDialog.ordenId = orden.id
            this.confirmDialog.title = `¿Eliminar orden ${orden.order_code}?`
            this.confirmDialog.show = true
        },

        async onConfirmDelete() {
            const id = this.confirmDialog.ordenId
            try {
                await ordenClienteService.deleteOrden(id)
                this.allOrdenes = this.allOrdenes.filter(o => o.id !== id)
                this.ordenes = this.allOrdenes
                this.confirmDialog.show = false
                this.notification = {
                    show: true,
                    message: 'Orden eliminada exitosamente',
                    type: 'success'
                }
            } catch (e) {
                console.error('Error al eliminar orden', e)
                this.notification = {
                    show: true,
                    message: 'No se pudo eliminar la orden',
                    type: 'error'
                }
            }
        },

        async handleImportComplete(importedData) {
            console.log('Datos importados:', importedData)
            let successCount = 0
            let errorCount = 0

            for (const orden of importedData) {
                try {
                    await ordenClienteService.createOrden(orden)
                    successCount++
                } catch (e) {
                    console.error('Error al importar orden:', e)
                    errorCount++
                }
            }

            if (errorCount === 0) {
                this.notification = {
                    show: true,
                    message: `${successCount} orden(es) importada(s) exitosamente`,
                    type: 'success'
                }
            } else {
                this.notification = {
                    show: true,
                    message: `${successCount} importadas, ${errorCount} con errores`,
                    type: 'warning'
                }
            }

            this.currentPage = 1
            this.cargarOrdenes()
        },

        onModalClose() {
            this.showFormModal = false
            this.formEditId = null
        },

        onModalSaved(detail) {
            this.notification = {
                show: true,
                message: detail && detail.action === 'updated' ? 'Orden actualizada' : 'Orden creada',
                type: 'success'
            }
            this.currentPage = 1
            this.cargarOrdenes()
        },

        formatearEstado(estado) {
            const estados = {
                'pending': 'Pendiente',
                'confirmed': 'Confirmada',
                'in_progress': 'En Proceso',
                'completed': 'Completada',
                'cancelled': 'Cancelada'
            }
            return estados[estado] || estado
        },

        formatearFecha(fecha) {
            if (!fecha) return '-'
            const date = new Date(fecha)
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        },

        formatearMonto(monto) {
            return parseFloat(monto || 0).toFixed(2)
        }
    }
}
</script>

<style scoped>
.badge-estado {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
}

.estado-pending {
    background: #FEF3C7;
    color: #D97706;
}

.estado-confirmed {
    background: #DBEAFE;
    color: #1E40AF;
}

.estado-in_progress {
    background: #E0E7FF;
    color: #4F46E5;
}

.estado-completed {
    background: #D1FAE5;
    color: #059669;
}

.estado-cancelled {
    background: #FEE2E2;
    color: #DC2626;
}

.btn-icon.btn-view {
    font-size: 18px;
}
</style>