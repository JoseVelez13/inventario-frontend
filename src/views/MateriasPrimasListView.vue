<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">Materias Primas</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de materias primas">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Importar materias primas desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar materias primas a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear una nueva materia prima">
          <button class="btn-primary" @click="openCreateModal">Nuevo</button>
        </Tooltip>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <div class="search-bar">
          <input 
            v-model="search" 
            @input="onSearch" 
            type="text" 
            placeholder="Buscar por código, nombre o descripción..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando materias primas...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">🧪</div>
          <h3>No hay materias primas registradas</h3>
          <p>Comienza agregando tu primera materia prima</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th class="sortable-header" @click="toggleSort('materia_prima_id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'materia_prima_id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'materia_prima_id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('codigo')">
                <div class="header-content">
                  <span>Código</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'codigo' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'codigo' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('nombre')">
                <div class="header-content">
                  <span>Nombre</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'nombre' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'nombre' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th>Descripción</th>
              <th>Unidad</th>

              <th class="sortable-header" @click="toggleSort('densidad')">
                <div class="header-content">
                  <span>Densidad</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'densidad' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'densidad' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('stock_minimo')">
                <div class="header-content">
                  <span>Stock Mín.</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'stock_minimo' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'stock_minimo' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('stock_maximo')">
                <div class="header-content">
                  <span>Stock Máx.</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'stock_maximo' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'stock_maximo' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mp in paginatedData" :key="mp.materia_prima_id" :class="{'row-warning': isStockBajo(mp)}">
              <td class="h">{{ mp.materia_prima_id }}</td>
              <td class="h"><strong>{{ mp.codigo }}</strong></td>
              <td class="h">{{ mp.nombre }}</td>
              <td class="h">{{ mp.descripcion || '-' }}</td>
              <td class="h">{{ mp.unidad || '-' }}</td>
              <td class="h">{{ mp.densidad ? mp.densidad + ' g/cm³' : '-' }}</td>
              <td class="h">
                <span :class="{'badge-warning': isStockBajo(mp)}">
                  {{ Math.floor(mp.stock_minimo) || 0 }}
                </span>
              </td>
              <td class="h">{{ mp.stock_maximo ? Math.floor(mp.stock_maximo) : '-' }}</td>
              <td class="action-buttons">
                <Tooltip text="Editar materia prima">
                  <button class="btn-icon btn-edit" @click.prevent="openEditModal(mp.materia_prima_id)">
                    ✏️
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar materia prima">
                  <button class="btn-icon btn-delete" @click="deleteMateriaPrima(mp.materia_prima_id)">
                    🗑️
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="materiasPrimas.length > 0" class="pagination-container">
          <div class="pagination-info">
            <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalMateriasPrimas }} materias primas</span>
          </div>
          <div class="pagination-controls">
            <button 
              class="btn-secondary" 
              @click="previousPage" 
              :disabled="currentPage === 1"
            >
              ← Anterior
            </button>
            <div class="page-indicator">
              <label for="page-input">Página:</label>
              <input 
                id="page-input"
                v-model.number="currentPage" 
                @change="goToPage"
                type="number" 
                min="1" 
                :max="totalPages"
                class="page-input"
              >
              <span>de {{ totalPages }}</span>
            </div>
            <button 
              class="btn-secondary" 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="onConfirmDelete"
      @cancel="confirmDialog.show = false"
    />

    <ImportExportDialog
      :show="importExportDialog.show"
      :mode="importExportDialog.mode"
      :data="materiasPrimas"
      :columns="exportColumns"
      :item-count="materiasPrimas.length"
      entity-name="Materias Primas"
      :api-endpoint="apiEndpoint"
      @close="importExportDialog.show = false"
      @import-complete="handleImportComplete"
    />

    <Notification
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      :title="notification.title"
      @close="notification.show = false"
    />

    <MateriaPrimaFormModal
      :show="showFormModal"
      :edit-id="formEditId"
      @close="onModalClose"
      @saved="onModalSaved"
    />
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import Notification from '../components/Notification.vue'
import MateriaPrimaFormModal from '../components/MateriaPrimaFormModal.vue'
import '../assets/styles/MateriasPrimas.css'
import materiasPrimasService from '../services/materiasPrimasService'

export default {
  name: 'MateriasPrimasListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, ImportExportDialog, Notification, MateriaPrimaFormModal },
  
  data() {
    return {
      search: '',
      materiasPrimas: [],
      loading: false,
      error: '',
      sortField: 'materia_prima_id',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
      confirmDialog: {
        show: false,
        title: '¿Eliminar materia prima?',
        message: 'Esta acción no se puede deshacer.',
        materiaPrimaId: null
      },
      importExportDialog: { show: false, mode: 'export' },
      apiEndpoint: 'http://localhost:8000/api/materias-primas/',
      exportColumns: [
        { key: 'materia_prima_id', label: 'ID' },
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'unidad', label: 'Unidad' },
        { key: 'densidad', label: 'Densidad (g/cm³)' },
        { key: 'stock_minimo', label: 'Stock Mínimo' },
        { key: 'stock_maximo', label: 'Stock Máximo' }
      ],
      notification: {
        show: false,
        message: '',
        type: 'success',
        title: ''
      },
      // Modal/form state
      showFormModal: false,
      formEditId: null
    }
  },

  created() {
    this.fetchMateriasPrimas()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      let result = this.materiasPrimas
      
      if (q) {
        result = result.filter(mp =>
          String(mp.materia_prima_id || mp.id).includes(q) ||
          mp.codigo.toLowerCase().includes(q) ||
          mp.nombre.toLowerCase().includes(q) ||
          (mp.descripcion || '').toLowerCase().includes(q)
        )
      }

      return this.sortData(result)
    },

    totalMateriasPrimas() {
      return this.filtered.length
    },

    totalPages() {
      return Math.ceil(this.totalMateriasPrimas / this.itemsPerPage)
    },

    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filtered.slice(start, end)
    },

    startItem() {
      return this.totalMateriasPrimas === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1
    },

    endItem() {
      const end = this.currentPage * this.itemsPerPage
      return end > this.totalMateriasPrimas ? this.totalMateriasPrimas : end
    }
  },

  methods: {
    async fetchMateriasPrimas() {
      this.loading = true
      this.error = ''
      try {
        const data = await materiasPrimasService.getMateriasPrimas()
        this.materiasPrimas = Array.isArray(data) ? data : data.results || []
      } catch (e) {
        console.error('Error al listar materias primas', e)
        this.error = 'No se pudo cargar la lista de materias primas.'
      } finally {
        this.loading = false
      }
    },

    onSearch() {},

    clearSearch() {
      this.search = ''
      this.$nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      })
    },

    reload() {
      this.fetchMateriasPrimas()
    },

    openImport() {
      this.importExportDialog = { show: true, mode: 'import' }
    },

    openExport() {
      this.importExportDialog = { show: true, mode: 'export' }
    },

    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
      this.currentPage = 1
    },

    sortData(data) {
      if (!this.sortField) return data

      return [...data].sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]

        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''

        // Ordenamiento numérico para campos ID, densidad y stocks
        if (['materia_prima_id', 'densidad', 'stock_minimo', 'stock_maximo'].includes(this.sortField)) {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }

        // Ordenamiento alfabético para otros campos
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()

        if (this.sortOrder === 'asc') {
          return aStr.localeCompare(bStr, 'es', { numeric: true })
        } else {
          return bStr.localeCompare(aStr, 'es', { numeric: true })
        }
      })
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
      const isUpdate = detail && detail.action === 'updated'
      this.showNotification(
        'success', 
        isUpdate ? '✅ Materia prima actualizada' : '✅ Materia prima creada', 
        isUpdate ? 'La materia prima se actualizó correctamente' : 'La materia prima se guardó exitosamente'
      )
      this.currentPage = 1
      this.fetchMateriasPrimas()
    },

    isStockBajo(mp) {
      // Aquí podrías comparar con stock actual si está disponible
      // Por ahora solo es visual basado en stock_minimo
      return false
    },

    deleteMateriaPrima(id) {
      this.confirmDialog.materiaPrimaId = id
      this.confirmDialog.show = true
    },

    async onConfirmDelete() {
      const id = this.confirmDialog.materiaPrimaId
      this.confirmDialog.show = false
      
      try {
        await materiasPrimasService.deleteMateriaPrima(id)
        this.materiasPrimas = this.materiasPrimas.filter(mp => mp.materia_prima_id !== id)
        this.showNotification('success', '¡Eliminada!', 'Materia prima eliminada correctamente')
      } catch (e) {
        console.error('Error al eliminar materia prima', e)
        const errorMsg = e.response?.data?.detail || 'No se pudo eliminar la materia prima'
        this.showNotification('error', 'Error', errorMsg)
      }
    },

    async handleImportComplete(importedData) {
      console.log('Datos importados:', importedData)
      let successCount = 0
      let errorCount = 0

      for (const materiaPrima of importedData) {
        try {
          await materiasPrimasService.createMateriaPrima(materiaPrima)
          successCount++
        } catch (e) {
          console.error('Error al importar materia prima:', e)
          errorCount++
        }
      }

      this.showNotification(
        errorCount > 0 ? 'warning' : 'success', 
        errorCount > 0 ? '⚠️ Importación parcial' : '✅ Importación exitosa',
        errorCount > 0 ? `${successCount} importadas, ${errorCount} con errores` : `${successCount} materia(s) prima(s) importada(s) exitosamente`
      )
      
      this.fetchMateriasPrimas()
    },

    showNotification(type, title, message) {
      this.notification = { show: true, type, title, message }
    }
  }
}
</script>
