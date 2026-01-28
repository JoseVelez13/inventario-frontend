<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="topbar">
      <div class="topbar-title">
        Almacenes
        <span class="chip" aria-live="polite" title="Total de almacenes">
          <template v-if="!loading">{{ totalAlmacenes }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de almacenes">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Importar almacenes desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar almacenes a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo almacén">
          <button class="btn-primary" @click="openCreateModal">Nuevo</button>
        </Tooltip>
      </div>
    </div>
    <div class="content-box">
      <div class="content-body">
        <div class="search-bar">
          <input 
            v-model="searchInput" 
            @input="debouncedSearch" 
            type="text" 
            placeholder="Buscar por nombre o ubicación..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>
        <div class="filter-chips" v-if="activeChips.length">
          <span v-for="chip in activeChips" :key="chip.key" class="chip chip-filter">
            {{ chip.label }}
            <button class="chip-remove" @click="removeChip(chip.key)">×</button>
          </span>
        </div>
        <div v-if="loading" class="loading-state">Cargando almacenes...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="almacenes.length === 0" class="empty-state">
          <div class="empty-icon">🏭</div>
          <h3>No hay almacenes registrados</h3>
          <p>Comienza agregando tu primer almacén</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th class="sortable-header" @click="toggleSort('id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
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
              
              <th>Dirección</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="almacen in paginatedAlmacenes" :key="almacen.id">
              <td>{{ almacen.id }}</td>
              <td><strong>{{ almacen.nombre }}</strong></td>
              <td>{{ almacen.direccion || '-' }}</td>
              <td class="action-buttons">
                <Tooltip text="Editar almacén">
                  <button class="btn-icon btn-edit" @click="openEditModal(almacen.id)" aria-label="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar almacén">
                  <button class="btn-icon btn-delete" @click="deleteAlmacen(almacen.id)" aria-label="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación -->
        <div v-if="almacenes.length > 0" class="pagination-container">
          <div class="pagination-info">
            <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalFiltered }} almacenes</span>
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
                :min="1" 
                :max="totalPages"
                class="page-input"
              />
              <span>de {{ totalPages }}</span>
            </div>
            <button 
              class="btn-secondary" 
              @click="nextPage" 
              :disabled="currentPage === totalPages || totalPages === 0"
            >
              Siguiente →
            </button>
          </div>
          <div class="pagination-size">
            <label for="page-size-select">Items por página:</label>
            <select v-model.number="pageSize" @change="changePageSize" id="page-size-select" class="page-size-select">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <!-- Modales -->
    <AlmacenFormModal 
      v-if="showFormModal" 
      :visible="showFormModal" 
      :edit-id="formEditId" 
      @close="showFormModal = false" 
      @saved="handleSaved" 
    />
    <ConfirmDialog 
      v-if="confirmDialog.show" 
      :title="confirmDialog.title" 
      :message="confirmDialog.message" 
      @confirm="confirmDelete" 
      @cancel="confirmDialog.show = false" 
    />
    <ImportExportDialog 
      v-if="importExportDialog.show" 
      :show="importExportDialog.show" 
      :mode="importExportDialog.mode" 
      :data="almacenes" 
      :columns="exportColumns" 
      :entity-name="'Almacenes'" 
      @close="importExportDialog.show = false" 
      @import-complete="handleImportComplete" 
    />
    <Notification 
      v-if="notification.show" 
      :type="notification.type" 
      :title="notification.title" 
      :message="notification.message" 
      @close="notification.show = false" 
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
import AlmacenFormModal from '../components/AlmacenFormModal.vue'
import almacenesService from '../services/almacenesService'

function debounce(fn, delay) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
}

export default {
  name: 'AlmacenesListView',
  components: { 
    HeaderGlobal, 
    Breadcrumbs, 
    Tooltip, 
    ConfirmDialog, 
    ImportExportDialog, 
    Notification, 
    AlmacenFormModal 
  },
  
  data() {
    return {
      search: '',
      searchInput: '',
      almacenes: [],
      loading: false,
      error: '',
      sortField: 'id',
      sortOrder: 'asc',
      currentPage: 1,
      pageSize: 20,
      confirmDialog: {
        show: false,
        title: '¿Eliminar almacén?',
        message: 'Esta acción no se puede deshacer.',
        almacenId: null
      },
      importExportDialog: { show: false, mode: 'export' },
      exportColumns: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'direccion', label: 'Dirección' }
      ],
      notification: { show: false, type: '', title: '', message: '' },
      showFormModal: false,
      formEditId: null
    }
  },

  computed: {
    totalAlmacenes() {
      return this.almacenes.length
    },
    
    filteredAlmacenes() {
      let filtered = [...this.almacenes]
      
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(a => 
          a.nombre.toLowerCase().includes(searchLower) ||
          (a.direccion && a.direccion.toLowerCase().includes(searchLower))
        )
      }
      
      return filtered
    },
    
    sortedAlmacenes() {
      return this.filteredAlmacenes.sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]
        
        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()
        
        if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },
    
    paginatedAlmacenes() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sortedAlmacenes.slice(start, end)
    },
    
    totalFiltered() {
      return this.sortedAlmacenes.length
    },
    
    totalPages() {
      return Math.ceil(this.totalFiltered / this.pageSize)
    },
    
    startItem() {
      return this.totalFiltered === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1
    },
    
    endItem() {
      return Math.min(this.currentPage * this.pageSize, this.totalFiltered)
    },

    activeChips() {
      const chips = []
      if (this.search) chips.push({ key: 'search', label: `Buscar: "${this.search}"` })
      return chips
    }
  },

  methods: {
    async fetchAlmacenes() {
      this.loading = true
      this.error = ''
      try {
        const data = await almacenesService.getAlmacenes()
        this.almacenes = data.results || data
      } catch (e) {
        this.error = 'Error al cargar almacenes'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    reload() {
      this.fetchAlmacenes()
    },

    debouncedSearch: debounce(function() {
      this.search = this.searchInput
      this.currentPage = 1
    }, 300),

    clearSearch() {
      this.search = ''
      this.searchInput = ''
      this.currentPage = 1
    },

    removeChip(key) {
      if (key === 'search') this.clearSearch()
      this.currentPage = 1
    },

    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
    },

    goToPage() {
      if (this.currentPage < 1) {
        this.currentPage = 1
      } else if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages
      }
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

    changePageSize() {
      this.currentPage = 1
    },

    reload() {
      this.currentPage = 1
      this.fetchAlmacenes()
    },

    openImport() {
      this.importExportDialog = { show: true, mode: 'import' }
    },

    openExport() {
      this.importExportDialog = { show: true, mode: 'export' }
    },

    async handleImportComplete(importedData) {
      let successCount = 0
      let errorCount = 0

      for (const almacen of importedData) {
        try {
          const normalized = almacen._normalized || {}
          const cleanData = {
            nombre: String(normalized.nombre || '').trim(),
            direccion: String(normalized.direccion || '').trim()
          }
          
          await almacenesService.createAlmacen(cleanData)
          successCount++
        } catch (e) {
          console.error('Error al importar almacén:', e)
          errorCount++
        }
      }

      this.importExportDialog.show = false
      await this.fetchAlmacenes()

      const message = `${successCount} almacén(es) importado(s)${errorCount > 0 ? `, ${errorCount} error(es)` : ''}`
      this.showNotification(
        errorCount > 0 ? 'warning' : 'success', 
        errorCount > 0 ? 'Importación parcial' : '¡Importación completada!', 
        message
      )
    },

    deleteAlmacen(id) {
      this.confirmDialog.almacenId = id
      this.confirmDialog.show = true
    },

    async confirmDelete() {
      try {
        await almacenesService.deleteAlmacen(this.confirmDialog.almacenId)
        this.showNotification('success', '¡Eliminado!', 'Almacén eliminado exitosamente')
        await this.fetchAlmacenes()
      } catch (e) {
        this.showNotification('error', 'Error', 'No se pudo eliminar el almacén')
        console.error(e)
      } finally {
        this.confirmDialog.show = false
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

    async handleSaved() {
      await this.fetchAlmacenes()
      this.showNotification('success', '¡Guardado!', 'Almacén guardado exitosamente')
    },

    showNotification(type, title, message) {
      this.notification = { show: true, type, title, message }
    }
  },

  mounted() {
    this.fetchAlmacenes()
  }
}
</script>

<style scoped>
@import '../assets/styles/Clientes.css';

.filter-chips {
  margin: 8px 0 12px 0;
}
.chip-filter {
  display: inline-flex;
  align-items: center;
  background: #e0e7ef;
  color: #2a3b4d;
  border-radius: 16px;
  padding: 0 10px;
  margin-right: 8px;
  font-size: 0.95em;
  height: 28px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  transition: background 0.2s;
}
.chip-filter:hover {
  background: #c7d2e5;
}
.chip-remove {
  background: none;
  border: none;
  color: #888;
  font-size: 1.1em;
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.2s;
}
.chip-remove:hover {
  color: #d32f2f;
}
.filter-select {
  margin-left: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #cfd8dc;
  background: #f8fafc;
  color: #2a3b4d;
  font-size: 1em;
}
</style>
