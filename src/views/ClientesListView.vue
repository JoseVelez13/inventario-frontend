<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="bg-fondo-clientes"></div>

    <div class="topbar">
      <div class="topbar-title">
        Clientes
        <span class="chip" aria-live="polite" title="Total de clientes">
          <template v-if="!loading">{{ clientes.length }}</template>
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
            v-model="search" 
            @input="onSearch" 
            type="text" 
            placeholder="Buscar por RUC, Empresa, Contacto..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>
        <div v-if="loading" class="loading-state">Cargando clientes...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
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
            <tr v-for="c in sortedAndFiltered" :key="c.cliente_id || c.id">
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
            <tr v-if="filtered.length === 0">
              <td colspan="8" style="text-align:center; color:#6b7c93; padding: 16px;">Sin resultados</td>
            </tr>
          </tbody>
        </table>
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
      :item-count="clientes.length"
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

export default {
  name: 'ClientesListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, ImportExportDialog, Notification, ClienteFormModal },
  data() {
  
    return {
      search: '',
      clientes: [],
      loading: false,
      error: '',
      sortField: null,
      sortOrder: 'asc',
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
    filtered() {
      if (!this.search) {
        return this.clientes
      }
      const term = this.search.toLowerCase()
      return this.clientes.filter(c => {
        return (
          (c.ruc && c.ruc.toLowerCase().includes(term)) ||
          (c.nombre_empresa && c.nombre_empresa.toLowerCase().includes(term)) ||
          (c.nombre_contacto && c.nombre_contacto.toLowerCase().includes(term)) ||
          (c.telefono && c.telefono.toLowerCase().includes(term)) ||
          (c.email && c.email.toLowerCase().includes(term)) ||
          (c.direccion && c.direccion.toLowerCase().includes(term))
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
  async fetchClientes() {
    this.loading = true
    this.error = ''
    try {
      const data = await clientesService.getClientes()

      // Soporte para paginación de DRF
      this.clientes = Array.isArray(data) ? data : data.results || []
    } catch (e) {
      console.error('Error al listar clientes', e)
      this.error = 'No se pudo cargar la lista de clientes.'
    } finally {
      this.loading = false
    }
  },
    onSearch() {},

    clearSearch() {
      this.search = ''
      // Poner focus en el campo de búsqueda después de limpiar
      this.$nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      })
    },

    reload() {
      this.fetchClientes()
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
        this.clientes = this.clientes.filter(
          c => (c.cliente_id || c.id) !== id
        )
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
      
      this.fetchClientes()
    },

    // Modal handlers
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
      this.fetchClientes()
    }
  }
  
}
</script>
