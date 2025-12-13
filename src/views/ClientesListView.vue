<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="bg-fondo-clientes"></div>

    <div class="topbar">
      <div class="topbar-title">Clientes</div>
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
          <button class="btn-primary" @click="$router.push('/clientes/nuevo')">Nuevo</button>
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
              <th>ID</th>
              <th>RUC</th>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.cliente_id">
              <td class="h">{{ c.cliente_id }}</td>
              <td class="h">{{ c.ruc }}</td>
              <td class="h">{{ c.nombre_empresa }}</td>
              <td class="h">{{ c.nombre_contacto || '-' }}</td>
              <td class="h">{{ c.telefono || '-' }}</td>
              <td class="h">{{ c.email }}</td>
              <td class="h">{{ c.direccion }}</td>
              <td class="action-buttons">
                <Tooltip text="Editar cliente">
                  <button class="btn-icon btn-edit" @click="$router.push(`/clientes/nuevo?edit=${c.cliente_id}`)">
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
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import Notification from '../components/Notification.vue'
import '../assets/styles/Clientes.css'
import clientesService from '../services/clientesService'

export default {
  name: 'ClientesListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, ImportExportDialog, Notification },
  data() {
    return {
      search: '',
      clientes: [],
      loading: false,
      error: '',
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
      }
    }
  },

  created() {
    this.fetchClientes()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.clientes
      return this.clientes.filter(c =>
        String(c.cliente_id || c.id).includes(q) ||
        c.ruc.toLowerCase().includes(q) ||
        c.nombre_empresa.toLowerCase().includes(q) ||
        (c.nombre_contacto || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
  },

  methods: {
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
    }
  }
}
</script>
