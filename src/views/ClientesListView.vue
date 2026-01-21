<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="topbar">
      <div class="topbar-title">
        Clientes
        <span class="chip" aria-live="polite" title="Total de clientes">
          <template v-if="!loading">{{ totalClientes }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de clientes">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Importar clientes desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar clientes a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo cliente">
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
            placeholder="Buscar por nombre, RUC o correo..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
          <select v-model="filters.estado" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div class="filter-chips" v-if="activeChips.length">
          <span v-for="chip in activeChips" :key="chip.key" class="chip chip-filter">
            {{ chip.label }}
            <button class="chip-remove" @click="removeChip(chip.key)">×</button>
          </span>
        </div>
        <div v-if="loading" class="loading-state">Cargando clientes...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="clientes.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No hay clientes registrados</h3>
          <p>Comienza agregando tu primer cliente</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th class="sortable-header" @click="toggleSort('cliente_id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'cliente_id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'cliente_id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('ruc')">
                <div class="header-content">
                  <span>RUC</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'ruc' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'ruc' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('nombre_empresa')">
                <div class="header-content">
                  <span>Empresa</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'nombre_empresa' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'nombre_empresa' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('nombre_contacto')">
                <div class="header-content">
                  <span>Contacto</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'nombre_contacto' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'nombre_contacto' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('telefono')">
                <div class="header-content">
                  <span>Teléfono</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'telefono' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'telefono' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('email')">
                <div class="header-content">
                  <span>Email</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'email' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'email' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th>Dirección</th>
              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in paginatedData" :key="c.cliente_id || c.id">
              <td class="h">{{ c.cliente_id || c.id }}</td>
              <td class="h">{{ c.ruc }}</td>
              <td class="h">{{ c.nombre_empresa }}</td>
              <td class="h">{{ c.nombre_contacto || '-' }}</td>
              <td class="h">{{ c.telefono || '-' }}</td>
              <td class="h">{{ c.email }}</td>
              <td class="h">{{ c.direccion }}</td>
              <td class="action-buttons">
                <Tooltip text="Editar cliente">
                  <button class="btn-icon btn-edit" @click.prevent="openEditModal(c.cliente_id)">
                    ✏️
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar cliente">
                  <button class="btn-icon btn-delete" @click="deleteCliente(c.cliente_id)">
                    🗑️
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="clientes.length > 0" class="pagination-container">
          <div class="pagination-info">
            <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalClientes }} clientes</span>
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
      :data="clientes"
      :columns="exportColumns"
      :item-count="totalClientes"
      entity-name="Clientes"
      :api-endpoint="apiEndpoint"
      @close="importExportDialog.show = false"
      @import-complete="handleImportComplete"
    />

    <Notification
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="notification.show = false"
    />

    <ClienteFormModal
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
import ClienteFormModal from '../components/ClienteFormModal.vue'
import '../assets/styles/Clientes.css'
import clientesService from '../services/clientesService'

function debounce(fn, delay) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
}

export default {
  name: 'ClientesListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, ImportExportDialog, Notification, ClienteFormModal },
  data() {
    return {
      search: '',
      searchInput: '',
      filters: { estado: '' },
      clientes: [],
      allClientes: [], // Almacena TODOS los clientes
      loading: false,
      error: '',
      sortField: null,
      sortOrder: 'asc',
      currentPage: 1,
      pageSize: 20,
      totalClientes: 0,
      confirmDialog: {
        show: false,
        title: '¿Eliminar cliente?',
        message: 'Esta acción no se puede deshacer.',
        clienteId: null
      },
      importExportDialog: { show: false, mode: 'export' },
      apiEndpoint: 'http://localhost:8000/api/clientes/',
      exportColumns: [
        { key: 'cliente_id', label: 'ID' },
        { key: 'ruc', label: 'RUC' },
        { key: 'nombre_empresa', label: 'Empresa' },
        { key: 'nombre_contacto', label: 'Contacto' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
        { key: 'direccion', label: 'Dirección' }
      ],
      notification: {
        show: false,
        message: '',
        type: 'success'
      },
      // Modal/form state
      showFormModal: false,
      formEditId: null
    }
  },

  created() {
    this.fetchClientes()
  },

  computed: {
    // Obtener clientes filtrados por búsqueda (de TODOS los clientes)
    filtered() {
      let data = this.allClientes || []
      const q = this.search.trim().toLowerCase()
      if (q) {
        data = data.filter(c =>
          (c.nombre || '').toLowerCase().includes(q) ||
          (c.ruc || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q)
        )
      }
      if (this.filters.estado) {
        data = data.filter(c => {
          if (this.filters.estado === 'activo') return c.activo !== false
          if (this.filters.estado === 'inactivo') return c.activo === false
          return true
        })
      }
      return data
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

        if (this.sortField === 'cliente_id') {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
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
      if (this.filters.estado) {
        chips.push({ key: 'estado', label: `Estado: ${this.filters.estado === 'activo' ? 'Activo' : 'Inactivo'}` })
      }
      return chips
    }
  },

  methods: {
    debouncedSearch: debounce(function() {
      this.search = this.searchInput
      this.currentPage = 1
    }, 300),

    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
    },

    async fetchClientes() {
      this.loading = true
      this.error = ''
      try {
        // Cargar TODOS los clientes (sin paginación en frontend)
        let allData = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const response = await clientesService.getClientes(page, 100) // 100 items por solicitud
          
          if (response.results) {
            allData = allData.concat(response.results)
            this.totalClientes = response.count || 0
            // Verificar si hay más páginas
            hasMore = !!response.next
            page++
          } else {
            // Fallback si no hay paginación
            allData = Array.isArray(response) ? response : []
            this.totalClientes = allData.length
            hasMore = false
          }
        }
        
        this.allClientes = allData
        this.clientes = allData // Para compatibilidad con export
        this.currentPage = 1 // Reset a primera página
      } catch (e) {
        console.error('Error al listar clientes', e)
        this.error = 'No se pudo cargar la lista de clientes.'
      } finally {
        this.loading = false
      }
    },

    onSearch() {
      // Resetear a la primera página cuando se busca
      this.currentPage = 1
    },

    clearSearch() {
      this.search = ''
      this.searchInput = ''
      this.currentPage = 1
      this.$nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      })
    },

    reload() {
      this.currentPage = 1
      this.fetchClientes()
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

    deleteCliente(id) {
      this.confirmDialog.clienteId = id
      this.confirmDialog.show = true
    },

    async onConfirmDelete() {
      const id = this.confirmDialog.clienteId
      try {
        await clientesService.deleteCliente(id)
        this.allClientes = this.allClientes.filter(
          c => (c.cliente_id || c.id) !== id
        )
        this.clientes = this.allClientes
        this.totalClientes--
        this.confirmDialog.show = false
        this.notification = {
          show: true,
          message: 'Cliente eliminado exitosamente',
          type: 'success'
        }
      } catch (e) {
        console.error('Error al eliminar cliente', e)
        this.notification = {
          show: true,
          message: 'No se pudo eliminar el cliente',
          type: 'error'
        }
      }
    },

    async handleImportComplete(importedData) {
      console.log('Datos importados:', importedData)
      let successCount = 0
      let errorCount = 0

      for (const cliente of importedData) {
        try {
          await clientesService.createCliente(cliente)
          successCount++
        } catch (e) {
          console.error('Error al importar cliente:', e)
          errorCount++
        }
      }

      if (errorCount === 0) {
        this.notification = {
          show: true,
          message: `${successCount} cliente(s) importado(s) exitosamente`,
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
      this.fetchClientes()
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
        message: detail && detail.action === 'updated' ? 'Cliente actualizado' : 'Cliente creado',
        type: 'success'
      }
      this.currentPage = 1
      this.fetchClientes()
    },

    removeChip(key) {
      if (key === 'search') this.clearSearch()
      if (key === 'estado') this.filters.estado = ''
      this.currentPage = 1
    },
  }
}
</script>

<style scoped>
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
