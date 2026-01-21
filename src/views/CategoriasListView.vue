<template>
    <div class="page-container">
        <HeaderGlobal />
        <Breadcrumbs />
        <div class="bg-fondo-clientes"></div>

        <div class="topbar">
            <div class="topbar-title">
                Categorías
                <span class="chip" aria-live="polite" title="Total de categorías">
                    <template v-if="!loading">{{ totalCategorias }}</template>
                    <template v-else>...</template>
                </span>
            </div>
            <div class="topbar-actions">
                <Tooltip text="Volver a la página anterior">
                    <button class="btn-secondary" @click="$router.back()">Atrás</button>
                </Tooltip>
                <Tooltip text="Recargar lista de categorías">
                    <button class="btn-secondary" @click="reload">Refrescar</button>
                </Tooltip>
                <Tooltip text="Importar categorías desde archivo">
                    <button class="btn-secondary" @click="openImport">📥 Importar</button>
                </Tooltip>
                <Tooltip text="Exportar categorías a archivo">
                    <button class="btn-secondary" @click="openExport">📤 Exportar</button>
                </Tooltip>
                <Tooltip text="Crear una nueva categoría">
                    <button class="btn-primary" @click="openCreateModal">Nuevo</button>
                </Tooltip>
            </div>
        </div>

        <div class="content-box">
            <div class="content-body">
                <div class="search-bar">
                    <input v-model="search" @input="onSearch" type="text" placeholder="Buscar por nombre, tipo..."
                        class="search-input" />
                    <select v-model="filtroTipo" class="search-input" style="flex: 0 0 200px" @change="onSearch">
                        <option value="">Todos los tipos</option>
                        <option value="PRODUCT">Producto</option>
                        <option value="RAW_MATERIAL">Materia Prima</option>
                    </select>
                    <button class="btn-secondary" @click="clearSearch">Limpiar</button>
                </div>

                <div v-if="loading" class="loading-state">Cargando categorías...</div>
                <div v-else-if="error" class="alert-error">{{ error }}</div>
                <div v-else-if="categorias.length === 0" class="empty-state">
                    <div class="empty-icon">📁</div>
                    <h3>No hay categorías registradas</h3>
                    <p>Comienza agregando tu primera categoría</p>
                </div>
                <table v-else class="table">
                    <thead>
                        <tr>
                            <th class="sortable-header" @click="toggleSort('categoria_id')">
                                <div class="header-content">
                                    <span>ID</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'categoria_id' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'categoria_id' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('nombre')">
                                <div class="header-content">
                                    <span>Nombre</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'nombre' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'nombre' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th class="sortable-header" @click="toggleSort('tipo')">
                                <div class="header-content">
                                    <span>Tipo</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'tipo' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'tipo' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th>Descripción</th>

                            <th class="sortable-header" @click="toggleSort('fecha_creacion')">
                                <div class="header-content">
                                    <span>Fecha Creación</span>
                                    <div class="sort-indicator">
                                        <i v-if="sortField === 'fecha_creacion' && sortOrder === 'asc'"
                                            class="fa-solid fa-sort-up active"></i>
                                        <i v-else-if="sortField === 'fecha_creacion' && sortOrder === 'desc'"
                                            class="fa-solid fa-sort-down active"></i>
                                        <i v-else class="fa-solid fa-sort"></i>
                                    </div>
                                </div>
                            </th>

                            <th style="width:100px; text-align:center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="c in paginatedData" :key="c.categoria_id">
                            <td class="h">{{ c.categoria_id }}</td>
                            <td class="h">{{ c.nombre }}</td>
                            <td>
                                <span class="badge-tipo" :class="'tipo-' + c.tipo">
                                    {{ formatearTipo(c.tipo) }}
                                </span>
                            </td>
                            <td class="h">{{ c.descripcion || '-' }}</td>
                            <td class="h">{{ formatearFecha(c.fecha_creacion) }}</td>
                            <td class="action-buttons">
                                <Tooltip text="Editar categoría">
                                    <button class="btn-icon btn-edit" @click="openEditModal(c.categoria_id)">
                                        ✏️
                                    </button>
                                </Tooltip>
                                <Tooltip text="Eliminar categoría">
                                    <button class="btn-icon btn-delete" @click="deleteCategoria(c.categoria_id)">
                                        🗑️
                                    </button>
                                </Tooltip>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Paginación -->
                <div v-if="categorias.length > 0" class="pagination-container">
                    <div class="pagination-info">
                        <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalCategorias }} categorías</span>
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

        <ImportExportDialog :show="importExportDialog.show" :mode="importExportDialog.mode" :data="categorias"
            :columns="exportColumns" :item-count="totalCategorias" entity-name="Categorías" :api-endpoint="apiEndpoint"
            @close="importExportDialog.show = false" @import-complete="handleImportComplete" />

        <Notification :show="notification.show" :message="notification.message" :type="notification.type"
            @close="notification.show = false" />

        <CategoriaFormModal :show="showFormModal" :edit-id="formEditId" @close="onModalClose" @saved="onModalSaved" />
    </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import Notification from '../components/Notification.vue'
import CategoriaFormModal from '../components/CategoriaFormModal.vue'
import '../assets/styles/Clientes.css'
import categoriasService from '../services/categoriasService'

export default {
    name: 'CategoriasListView',
    components: {
        HeaderGlobal,
        Breadcrumbs,
        Tooltip,
        ConfirmDialog,
        ImportExportDialog,
        Notification,
        CategoriaFormModal
    },
    data() {
        return {
            search: '',
            filtroTipo: '',
            categorias: [],
            allCategorias: [],
            loading: false,
            error: '',
            sortField: null,
            sortOrder: 'asc',
            currentPage: 1,
            pageSize: 20,
            totalCategorias: 0,
            confirmDialog: {
                show: false,
                title: '¿Eliminar categoría?',
                message: 'Esta acción no se puede deshacer.',
                categoriaId: null
            },
            importExportDialog: { show: false, mode: 'export' },
            apiEndpoint: 'http://localhost:8000/api/categorias/',
            exportColumns: [
                { key: 'categoria_id', label: 'ID' },
                { key: 'nombre', label: 'Nombre' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'descripcion', label: 'Descripción' },
                { key: 'fecha_creacion', label: 'Fecha Creación' }
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
        this.fetchCategorias()
    },

    computed: {
        filtered() {
            let resultado = [...this.allCategorias]

            if (this.filtroTipo) {
                resultado = resultado.filter(c => c.tipo === this.filtroTipo)
            }

            if (!this.search) {
                return resultado
            }

            const term = this.search.toLowerCase()
            return resultado.filter(c => {
                return (
                    (c.nombre && c.nombre.toLowerCase().includes(term)) ||
                    (c.descripcion && c.descripcion.toLowerCase().includes(term)) ||
                    (c.tipo && c.tipo.toLowerCase().includes(term))
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

                if (this.sortField === 'categoria_id') {
                    aVal = Number(aVal) || 0
                    bVal = Number(bVal) || 0
                    return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
                }

                if (this.sortField === 'fecha_creacion') {
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

        async fetchCategorias() {
            this.loading = true
            this.error = ''
            try {
                let allData = []
                let page = 1
                let hasMore = true

                while (hasMore) {
                    const response = await categoriasService.getCategorias(page, 100)

                    if (response.results) {
                        allData = allData.concat(response.results)
                        this.totalCategorias = response.count || 0
                        hasMore = !!response.next
                        page++
                    } else {
                        allData = Array.isArray(response) ? response : []
                        this.totalCategorias = allData.length
                        hasMore = false
                    }
                }

                this.allCategorias = allData
                this.categorias = allData
                this.currentPage = 1
            } catch (e) {
                console.error('Error al listar categorías', e)
                this.error = 'No se pudo cargar la lista de categorías.'
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
            this.fetchCategorias()
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

        deleteCategoria(id) {
            this.confirmDialog.categoriaId = id
            this.confirmDialog.show = true
        },

        async onConfirmDelete() {
            const id = this.confirmDialog.categoriaId
            try {
                await categoriasService.deleteCategoria(id)
                this.allCategorias = this.allCategorias.filter(c => c.categoria_id !== id)
                this.categorias = this.allCategorias
                this.totalCategorias--
                this.confirmDialog.show = false
                this.notification = {
                    show: true,
                    message: 'Categoría eliminada exitosamente',
                    type: 'success'
                }
            } catch (e) {
                console.error('Error al eliminar categoría', e)
                this.notification = {
                    show: true,
                    message: 'No se pudo eliminar la categoría',
                    type: 'error'
                }
            }
        },

        async handleImportComplete(importedData) {
            console.log('Datos importados:', importedData)
            let successCount = 0
            let errorCount = 0

            for (const categoria of importedData) {
                try {
                    await categoriasService.createCategoria(categoria)
                    successCount++
                } catch (e) {
                    console.error('Error al importar categoría:', e)
                    errorCount++
                }
            }

            if (errorCount === 0) {
                this.notification = {
                    show: true,
                    message: `${successCount} categoría(s) importada(s) exitosamente`,
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
            this.fetchCategorias()
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
                message: detail && detail.action === 'updated' ? 'Categoría actualizada' : 'Categoría creada',
                type: 'success'
            }
            this.currentPage = 1
            this.fetchCategorias()
        },

        formatearTipo(tipo) {
            const tipos = {
                'PRODUCT': 'Producto',
                'RAW_MATERIAL': 'Materia Prima'
            }
            return tipos[tipo] || tipo
        },

        formatearFecha(fecha) {
            if (!fecha) return '-'
            const date = new Date(fecha)
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
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

.tipo-PRODUCT {
    background: #DBEAFE;
    color: #1E40AF;
}

.tipo-RAW_MATERIAL {
    background: #E0E7FF;
    color: #4F46E5;
}
</style>