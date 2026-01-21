<template>
    <div class="page-container">
        <HeaderGlobal />
        <Breadcrumbs />
        <div class="bg-fondo-clientes"></div>

        <div class="topbar">
            <div class="topbar-title">
                Inventario de Materiales
                <span class="chip" aria-live="polite" title="Total de registros">
                    <template v-if="!loading">{{ totalInventarios }}</template>
                    <template v-else>...</template>
                </span>
            </div>
            <div class="topbar-actions">
                <Tooltip text="Volver a la página anterior">
                    <button class="btn-secondary" @click="$router.back()">Atrás</button>
                </Tooltip>
                <Tooltip text="Recargar lista de inventario">
                    <button class="btn-secondary" @click="reload">Refrescar</button>
                </Tooltip>
                <Tooltip text="Importar inventario desde archivo">
                    <button class="btn-secondary" @click="openImport">📥 Importar</button>
                </Tooltip>
                <Tooltip text="Exportar inventario a archivo">
                    <button class="btn-secondary" @click="openExport">📤 Exportar</button>
                </Tooltip>
                <Tooltip text="Registrar nuevo inventario">
                    <button class="btn-primary" @click="openCreateModal">Nuevo</button>
                </Tooltip>
            </div>
        </div>

        <div class="content-box">
            <div class="content-body">
                <div class="search-bar">
                    <input v-model="search" @input="onSearch" type="text" placeholder="Buscar por ID, ítem, almacén..."
                        class="search-input" />
                    <select v-model="filtroTipo" class="search-input" style="flex: 0 0 200px" @change="onSearch">
                        <option value="">Todos los tipos</option>
                        <option value="MATERIA_PRIMA">Materia Prima</option>
                        <option value="PRODUCTO">Producto</option>
                    </select>
                    <button class="btn-secondary" @click="clearSearch">Limpiar</button>
                </div>

                <div v-if="loading" class="loading-state">Cargando inventario...</div>
                <div v-else-if="error" class="alert-error">{{ error }}</div>
                <div v-else-if="inventarios.length === 0" class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>No hay registros de inventario</h3>
                    <p>Comienza registrando tu primer inventario</p>
                </div>
                <table v-else class="table">
                    <thead>
                        <tr>
                            <th class="sortable-header" @click="toggleSort('inventario_material_id')">
                                <div class="header-content">
                                    <span>ID</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'inventario_material_id' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'inventario_material_id' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('item_nombre')">
                                <div class="header-content">
                                    <span>Ítem</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'item_nombre' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'item_nombre' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('tipo_item')">
                                <div class="header-content">
                                    <span>Tipo</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'tipo_item' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'tipo_item' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('almacen_nombre')">
                                <div class="header-content">
                                    <span>Almacén</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'almacen_nombre' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'almacen_nombre' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('cantidad')">
                                <div class="header-content">
                                    <span>Cantidad</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'cantidad' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'cantidad' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th>Unidad</th>

                            <th class="sortable-header" @click="toggleSort('fecha_actualizacion')">
                                <div class="header-content">
                                    <span>Última Actualización</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'fecha_actualizacion' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'fecha_actualizacion' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th style="width:100px; text-align:center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="inv in paginatedData" :key="inv.inventario_material_id">
                            <td class="h">{{ inv.inventario_material_id }}</td>
                            <td class="h">{{ inv.item_nombre || inv.object_id }}</td>
                            <td>
                                <span class="badge-tipo" :class="'tipo-' + inv.item_tipo">
                                    {{ formatearTipo(inv.item_tipo) }}
                                </span>
                            </td>
                            <td class="h">{{ inv.nombre_almacen || '-' }}</td>
                            <td class="h">
                                <strong :class="getCantidadClass(inv.cantidad)">
                                    {{ formatearCantidad(inv.cantidad) }}
                                </strong>
                            </td>
                            <td class="h">{{ inv.simbolo_unidad || inv.nombre_unidad || '-' }}</td>
                            <td class="h">{{ formatearFecha(inv.fecha_actualizacion) }}</td>
                            <td class="action-buttons">
                                <Tooltip text="Editar inventario">
                                    <button class="btn-icon btn-edit"
                                        @click="openEditModal(inv.inventario_material_id)">
                                        ✏️
                                    </button>
                                </Tooltip>
                                <Tooltip text="Eliminar inventario">
                                    <button class="btn-icon btn-delete"
                                        @click="deleteInventario(inv.inventario_material_id)">
                                        🗑️
                                    </button>
                                </Tooltip>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Paginación -->
                <div v-if="inventarios.length > 0" class="pagination-container">
                    <div class="pagination-info">
                        <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalInventarios }} registros</span>
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

        <ConfirmDialog :show="confirmDialog.show" :title="confirmDialog.title" :message="confirmDialog.message"
            @confirm="onConfirmDelete" @cancel="confirmDialog.show = false" />

        <ImportExportDialog :show="importExportDialog.show" :mode="importExportDialog.mode" :data="inventarios"
            :columns="exportColumns" :item-count="totalInventarios" entity-name="Inventarios"
            :api-endpoint="apiEndpoint" @close="importExportDialog.show = false"
            @import-complete="handleImportComplete" />

        <Notification :show="notification.show" :message="notification.message" :type="notification.type"
            @close="notification.show = false" />

        <InventarioMaterialFormModal :show="showFormModal" :edit-id="formEditId" @close="onModalClose"
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
import InventarioMaterialFormModal from '../components/InventarioMaterialFormModal.vue'
import '../assets/styles/Clientes.css'
import inventarioMaterialService from '../services/inventarioMaterialService'

export default {
    name: 'InventarioMaterialesListView',
    components: {
        HeaderGlobal,
        Breadcrumbs,
        Tooltip,
        ConfirmDialog,
        ImportExportDialog,
        Notification,
        InventarioMaterialFormModal
    },
    data() {
        return {
            search: '',
            filtroTipo: '',
            inventarios: [],
            allInventarios: [],
            loading: false,
            error: '',
            sortField: null,
            sortOrder: 'asc',
            currentPage: 1,
            pageSize: 20,
            totalInventarios: 0,
            confirmDialog: {
                show: false,
                title: '¿Eliminar inventario?',
                message: 'Esta acción no se puede deshacer.',
                inventarioId: null
            },
            importExportDialog: { show: false, mode: 'export' },
            apiEndpoint: 'http://localhost:8000/api/inventario-materiales/',
            exportColumns: [
                { key: 'inventario_material_id', label: 'ID' },
                { key: 'item_nombre', label: 'Ítem' },
                { key: 'item_tipo', label: 'Tipo' },
                { key: 'nombre_almacen', label: 'Almacén' },
                { key: 'cantidad', label: 'Cantidad' },
                { key: 'simbolo_unidad', label: 'Unidad' },
                { key: 'fecha_actualizacion', label: 'Última Actualización' }
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
        this.fetchInventarios()
    },

    computed: {
        filtered() {
            let resultado = [...this.allInventarios]

            if (this.filtroTipo) {
                resultado = resultado.filter(inv => inv.item_tipo === this.filtroTipo)
            }

            if (!this.search) {
                return resultado
            }

            const term = this.search.toLowerCase()
            return resultado.filter(inv => {
                return (
                    (inv.inventario_material_id && inv.inventario_material_id.toLowerCase().includes(term)) ||
                    (inv.item_nombre && inv.item_nombre.toLowerCase().includes(term)) ||
                    (inv.object_id && inv.object_id.toLowerCase().includes(term)) ||
                    (inv.nombre_almacen && inv.nombre_almacen.toLowerCase().includes(term)) ||
                    (inv.nombre_unidad && inv.nombre_unidad.toLowerCase().includes(term))
                )
            })
        },

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

                if (this.sortField === 'cantidad') {
                    aVal = Number(aVal) || 0
                    bVal = Number(bVal) || 0
                    return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                }

                if (this.sortField === 'fecha_actualizacion') {
                    const dateA = new Date(aVal)
                    const dateB = new Date(bVal)
                    return this.sortOrder === 'asc' ? dateA - dateB : dateB - dateA
                }

                const aStr = String(aVal).toLowerCase()
                const bStr = String(bVal).toLowerCase()

                if (this.sortOrder === 'asc') {
                    return aStr.localeCompare(bStr, 'es', { numeric: true })
                } else {
                    return bStr.localeCompare(aStr, 'es', { numeric: true })
                }
            })
        },

        paginatedData() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.sortedAndFiltered.slice(start, end)
        },

        totalFiltered() {
            return this.filtered.length
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

        async fetchInventarios() {
            this.loading = true
            this.error = ''
            try {
                let allData = []
                let page = 1
                let hasMore = true

                while (hasMore) {
                    const response = await inventarioMaterialService.getInventarios(page, 100)

                    if (response.results) {
                        allData = allData.concat(response.results)
                        this.totalInventarios = response.count || 0
                        hasMore = !!response.next
                        page++
                    } else {
                        allData = Array.isArray(response) ? response : []
                        this.totalInventarios = allData.length
                        hasMore = false
                    }
                }

                this.allInventarios = allData
                this.inventarios = allData
                this.currentPage = 1
            } catch (e) {
                console.error('Error al listar inventarios', e)
                this.error = 'No se pudo cargar la lista de inventarios.'
            } finally {
                this.loading = false
            }
        },

        onSearch() {
            this.currentPage = 1
        },

        clearSearch() {
            this.search = ''
            this.filtroTipo = ''
            this.$nextTick(() => {
                const searchInput = document.querySelector('.search-input')
                if (searchInput) {
                    searchInput.focus()
                }
            })
        },

        reload() {
            this.currentPage = 1
            this.fetchInventarios()
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

        deleteInventario(id) {
            this.confirmDialog.inventarioId = id
            this.confirmDialog.show = true
        },

        async onConfirmDelete() {
            const id = this.confirmDialog.inventarioId
            try {
                await inventarioMaterialService.deleteInventario(id)
                this.allInventarios = this.allInventarios.filter(inv => inv.inventario_material_id !== id)
                this.inventarios = this.allInventarios
                this.totalInventarios--
                this.confirmDialog.show = false
                this.notification = {
                    show: true,
                    message: 'Inventario eliminado exitosamente',
                    type: 'success'
                }
            } catch (e) {
                console.error('Error al eliminar inventario', e)
                this.notification = {
                    show: true,
                    message: 'No se pudo eliminar el inventario',
                    type: 'error'
                }
            }
        },

        async handleImportComplete(importedData) {
            console.log('Datos importados:', importedData)
            let successCount = 0
            let errorCount = 0

            for (const inventario of importedData) {
                try {
                    await inventarioMaterialService.createInventario(inventario)
                    successCount++
                } catch (e) {
                    console.error('Error al importar inventario:', e)
                    errorCount++
                }
            }

            if (errorCount === 0) {
                this.notification = {
                    show: true,
                    message: `${successCount} inventario(s) importado(s) exitosamente`,
                    type: 'success'
                }
            } else {
                this.notification = {
                    show: true,
                    message: `${successCount} importados, ${errorCount} con errores`,
                    type: 'warning'
                }
            }

            this.currentPage = 1
            this.fetchInventarios()
        },

        openCreateModal() {
            this.formEditId = null
            this.showFormModal = true
        },

        openEditModal(id) {
            this.formEditId = id
            this.showFormModal = true
        },

        onModalClose() {
            this.showFormModal = false
            this.formEditId = null
        },

        onModalSaved(detail) {
            this.notification = {
                show: true,
                message: detail && detail.action === 'updated' ? 'Inventario actualizado' : 'Inventario registrado',
                type: 'success'
            }
            this.currentPage = 1
            this.fetchInventarios()
        },

        formatearTipo(tipo) {
            const tipos = {
                'MATERIA_PRIMA': 'Materia Prima',
                'PRODUCTO': 'Producto'
            }
            return tipos[tipo] || tipo
        },

        formatearCantidad(cantidad) {
            return parseFloat(cantidad || 0).toFixed(2)
        },

        getCantidadClass(cantidad) {
            const cant = parseFloat(cantidad || 0)
            if (cant === 0) return 'cantidad-cero'
            if (cant < 10) return 'cantidad-baja'
            return 'cantidad-normal'
        },

        formatearFecha(fecha) {
            if (!fecha) return '-'
            const date = new Date(fecha)
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }
}
</script>

<style scoped>
.badge-tipo {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
}

.tipo-MATERIA_PRIMA {
    background: #E0E7FF;
    color: #4F46E5;
}

.tipo-PRODUCTO {
    background: #DBEAFE;
    color: #1E40AF;
}

.cantidad-cero {
    color: #DC2626;
}

.cantidad-baja {
    color: #D97706;
}

.cantidad-normal {
    color: #059669;
}
</style>