<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Proveedores
        <span class="chip" aria-live="polite" title="Total de proveedores">
          <template v-if="!loading">{{ totalProveedores }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de proveedores">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Importar proveedores desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar proveedores a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo proveedor">
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
            placeholder="Buscar por RUC, Empresa, Contacto..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando proveedores...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="proveedores.length === 0" class="empty-state">
          <div class="empty-icon">🏭</div>
          <h3>No hay proveedores registrados</h3>
          <p>Comienza agregando tu primer proveedor</p>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th class="sortable-header" @click="toggleSort('proveedor_id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'proveedor_id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'proveedor_id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
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
              
              <th>Teléfono</th>
              <th>Email</th>
              <th>Tipo Producto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proveedor in paginatedProveedores" :key="proveedor.proveedor_id">
              <td>{{ proveedor.proveedor_id }}</td>
              <td><strong>{{ proveedor.ruc }}</strong></td>
              <td>{{ proveedor.nombre_empresa }}</td>
              <td>{{ proveedor.nombre_contacto || '-' }}</td>
              <td>{{ proveedor.telefono || '-' }}</td>
              <td>{{ proveedor.email || '-' }}</td>
              <td>{{ proveedor.tipo_producto || '-' }}</td>
              <td class="action-buttons">
                <Tooltip text="Editar proveedor">
                  <button class="btn-icon btn-edit" @click="openEditModal(proveedor.proveedor_id)" aria-label="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar proveedor">
                  <button class="btn-icon btn-delete" @click="deleteProveedor(proveedor.proveedor_id)" aria-label="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="btn-pagination" @click="goToPage(1)" :disabled="currentPage === 1">
            ← Anterior
          </button>
          <div class="pagination-info">
            Página 
            <input 
              v-model.number="currentPage" 
              type="number" 
              min="1" 
              :max="totalPages" 
              class="pagination-input"
            /> 
            de {{ totalPages }}
          </div>
          <button class="btn-pagination" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
            Siguiente →
          </button>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ProveedorFormModal 
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
      :data="proveedores" 
      :columns="exportColumns" 
      :entity-name="'Proveedores'" 
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
import ProveedorFormModal from '../components/ProveedorFormModal.vue'
import proveedoresService from '../services/proveedoresService'

export default {
  name: 'ProveedoresListView',
  components: { 
    HeaderGlobal, 
    Breadcrumbs, 
    Tooltip, 
    ConfirmDialog, 
    ImportExportDialog, 
    Notification, 
    ProveedorFormModal 
  },
  
  data() {
    return {
      search: '',
      proveedores: [],
      loading: false,
      error: '',
      sortField: 'proveedor_id',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
      confirmDialog: {
        show: false,
        title: '¿Eliminar proveedor?',
        message: 'Esta acción no se puede deshacer.',
        proveedorId: null
      },
      importExportDialog: { show: false, mode: 'export' },
      exportColumns: [
        { key: 'proveedor_id', label: 'ID' },
        { key: 'ruc', label: 'RUC' },
        { key: 'nombre_empresa', label: 'Nombre Empresa' },
        { key: 'nombre_contacto', label: 'Nombre Contacto' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email', label: 'Email' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'tipo_producto', label: 'Tipo Producto' }
      ],
      notification: { show: false, type: '', title: '', message: '' },
      showFormModal: false,
      formEditId: null
    }
  },

  computed: {
    totalProveedores() {
      return this.proveedores.length
    },
    
    filteredProveedores() {
      let filtered = [...this.proveedores]
      
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(p => 
          p.ruc.toLowerCase().includes(searchLower) ||
          p.nombre_empresa.toLowerCase().includes(searchLower) ||
          (p.nombre_contacto && p.nombre_contacto.toLowerCase().includes(searchLower)) ||
          (p.email && p.email.toLowerCase().includes(searchLower)) ||
          (p.telefono && p.telefono.includes(searchLower))
        )
      }
      
      return filtered
    },
    
    sortedProveedores() {
      return this.filteredProveedores.sort((a, b) => {
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
    
    paginatedProveedores() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.sortedProveedores.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.sortedProveedores.length / this.itemsPerPage)
    }
  },

  methods: {
    async fetchProveedores() {
      this.loading = true
      this.error = ''
      try {
        const data = await proveedoresService.getProveedores()
        this.proveedores = data.results || data
      } catch (e) {
        this.error = 'Error al cargar proveedores'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    reload() {
      this.fetchProveedores()
    },

    onSearch() {
      this.currentPage = 1
    },

    clearSearch() {
      this.search = ''
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

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
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

      for (const proveedor of importedData) {
        try {
          const normalized = proveedor._normalized || {}
          const cleanData = {
            ruc: String(normalized.ruc || '').trim(),
            nombre_empresa: String(normalized.nombre_empresa || '').trim(),
            nombre_contacto: String(normalized.nombre_contacto || '').trim(),
            telefono: String(normalized.telefono || '').trim(),
            email: String(normalized.email || '').trim(),
            direccion: String(normalized.direccion || '').trim(),
            tipo_producto: String(normalized.tipo_producto || '').trim()
          }
          
          await proveedoresService.createProveedor(cleanData)
          successCount++
        } catch (e) {
          console.error('Error al importar proveedor:', e)
          errorCount++
        }
      }

      this.importExportDialog.show = false
      await this.fetchProveedores()

      const message = `${successCount} proveedor(es) importado(s)${errorCount > 0 ? `, ${errorCount} error(es)` : ''}`
      this.showNotification(
        errorCount > 0 ? 'warning' : 'success', 
        errorCount > 0 ? 'Importación parcial' : '¡Importación completada!', 
        message
      )
    },

    deleteProveedor(id) {
      this.confirmDialog.proveedorId = id
      this.confirmDialog.show = true
    },

    async confirmDelete() {
      try {
        await proveedoresService.deleteProveedor(this.confirmDialog.proveedorId)
        this.showNotification('success', '¡Eliminado!', 'Proveedor eliminado exitosamente')
        await this.fetchProveedores()
      } catch (e) {
        this.showNotification('error', 'Error', 'No se pudo eliminar el proveedor')
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
      await this.fetchProveedores()
      this.showNotification('success', '¡Guardado!', 'Proveedor guardado exitosamente')
    },

    showNotification(type, title, message) {
      this.notification = { show: true, type, title, message }
    }
  },

  mounted() {
    this.fetchProveedores()
  }
}
</script>

<style scoped>
@import '../assets/styles/Clientes.css';
</style>
