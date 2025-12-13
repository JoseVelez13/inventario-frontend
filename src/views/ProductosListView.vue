<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">Productos</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de productos">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Importar productos desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar productos a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo producto">
          <button class="btn-primary" @click="$router.push('/productos/nuevo')">Nuevo</button>
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

        <div v-if="loading" class="loading-state">Cargando productos...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay productos registrados</h3>
          <p>Comienza agregando tu primer producto</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Peso</th>
              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.producto_id || p.id">
              <td>{{ p.producto_id || p.id }}</td>
              <td><strong>{{ p.product_code }}</strong></td>
              <td>{{ p.name }}</td>
              <td>{{ p.description || '-' }}</td>
              <td>{{ getUnidadNombre(p.unit) }}</td>
              <td>{{ p.weight }} kg</td>
              <td class="action-buttons">
                <Tooltip text="Editar producto">
                  <button class="btn-icon btn-edit" @click="$router.push(`/productos/nuevo?edit=${p.producto_id || p.id}`)">
                    ✏️
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar producto">
                  <button class="btn-icon btn-delete" @click="deleteProducto(p.producto_id || p.id)">
                    🗑️
                  </button>
                </Tooltip>
              </td>
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

    <Notification
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />

    <ImportExportDialog
      :show="importExportDialog.show"
      :mode="importExportDialog.mode"
      entity-name="Productos"
      :data="exportData"
      :columns="exportColumns"
      :item-count="productos.length"
      @close="importExportDialog.show = false"
      @import-complete="handleImportComplete"
    />
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Notification from '../components/Notification.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import '../assets/styles/Productos.css'
import productosService from '../services/productosService'

export default {
  name: 'ProductosListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, Notification, ImportExportDialog },
  
  data() {
    return {
      search: '',
      productos: [],
      unidades: [],
      loading: false,
      error: '',
      confirmDialog: {
        show: false,
        title: '¿Eliminar producto?',
        message: 'Esta acción no se puede deshacer.',
        productId: null
      },
      notification: {
        show: false,
        type: 'success',
        title: '',
        message: ''
      },
      importExportDialog: {
        show: false,
        mode: 'export'
      }
    }
  },

  created() {
    this.fetchProductos()
    this.fetchUnidades()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.productos
      return this.productos.filter(p =>
        String(p.producto_id || p.id).includes(q) ||
        p.product_code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    },

    exportData() {
      return this.productos.map(p => ({
        id: p.producto_id || p.id,
        product_code: p.product_code,
        name: p.name,
        description: p.description || '',
        unit: p.unit,
        weight: p.weight
      }))
    },

    exportColumns() {
      return [
        { key: 'id', label: 'ID' },
        { key: 'product_code', label: 'Código' },
        { key: 'name', label: 'Nombre' },
        { key: 'description', label: 'Descripción' },
        { key: 'unit', label: 'Unidad' },
        { key: 'weight', label: 'Peso (kg)' }
      ]
    }
  },

  methods: {
    getUnidadNombre(unitId) {
      const unidad = this.unidades.find(u => u.id === unitId)
      return unidad ? `${unidad.nombre} (${unidad.simbolo})` : unitId
    },

    async fetchUnidades() {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://localhost:8000/api/unidades/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        this.unidades = Array.isArray(data) ? data : data.results || []
        console.log('Unidades cargadas:', this.unidades)
      } catch (e) {
        console.error('Error al cargar unidades', e)
      }
    },

    async fetchProductos() {
      this.loading = true
      this.error = ''
      try {
        const data = await productosService.getProductos()
        this.productos = Array.isArray(data) ? data : data.results || []
      } catch (e) {
        console.error('Error al listar productos', e)
        this.error = 'No se pudo cargar la lista de productos.'
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
      this.fetchProductos()
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

      for (const item of importedData) {
        try {
          // Limpiar objeto: solo enviar campos que el backend espera
          // Asegurarse de que sean valores simples, no arrays
          const cleanData = {
            product_code: String(item.product_code || '').trim(),
            name: String(item.name || '').trim(),
            description: String(item.description || '').trim(),
            unit: Number(item.unit) || 1,
            weight: Number(item.weight) || 0.1
          }
          
          console.log('Enviando al backend:', cleanData)
          await productosService.createProducto(cleanData)
          successCount++
        } catch (e) {
          console.error('Error al importar:', item, e)
          console.error('Respuesta del servidor:', e.response?.data)
          errorCount++
        }
      }

      this.importExportDialog.show = false
      await this.fetchProductos()

      const message = `${successCount} producto(s) importado(s)${errorCount > 0 ? `, ${errorCount} error(es)` : ''}`
      this.showNotification(errorCount > 0 ? 'warning' : 'success', 
                           errorCount > 0 ? 'Importación parcial' : '¡Importación completada!', 
                           message)
    },

    deleteProducto(id) {
      this.confirmDialog.productId = id
      this.confirmDialog.show = true
    },

    async onConfirmDelete() {
      const id = this.confirmDialog.productId
      this.confirmDialog.show = false
      
      try {
        await productosService.deleteProducto(id)
        this.productos = this.productos.filter(
          p => (p.producto_id || p.id) !== id
        )
        this.showNotification('success', '¡Eliminado!', 'Producto eliminado correctamente')
      } catch (e) {
        console.error('Error al eliminar producto', e)
        const errorMsg = e.response?.data?.detail || e.response?.data?.error || 'No se pudo eliminar el producto'
        this.showNotification('error', 'Error', errorMsg)
      }
    },

    showNotification(type, title, message) {
      this.notification = { show: true, type, title, message }
    }
  }
}
</script>
