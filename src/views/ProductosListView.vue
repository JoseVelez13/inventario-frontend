<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Productos
        <span class="chip" aria-live="polite" title="Total de productos">
          <template v-if="!loading">{{ totalProductos }}</template>
          <template v-else>...</template>
        </span>
      </div>
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
              <th class="sortable-header" @click="toggleSort('producto_id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'producto_id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'producto_id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('product_code')">
                <div class="header-content">
                  <span>Código</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'product_code' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'product_code' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('name')">
                <div class="header-content">
                  <span>Nombre</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'name' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'name' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('nombre_categoria')">
                <div class="header-content">
                  <span>Categoría</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'nombre_categoria' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'nombre_categoria' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('description')">
                <div class="header-content">
                  <span>Descripción</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'description' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'description' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('unit')">
                <div class="header-content">
                  <span>Unidad</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'unit' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'unit' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th class="sortable-header" @click="toggleSort('weight')">
                <div class="header-content">
                  <span>Peso</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'weight' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'weight' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th class="sortable-header" @click="toggleSort('stock')">
                <div class="header-content">
                  <span>Stock</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'stock' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'stock' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>

              <th>Estado</th>

              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paginatedData" :key="p.producto_id || p.id" class="animate-fade-in">
              <td>{{ p.producto_id || p.id }}</td>
              <td><strong>{{ p.product_code }}</strong></td>
              <td>{{ p.name }}</td>
              <td>{{ p.nombre_categoria || '-' }}</td>
              <td>{{ p.description || '-' }}</td>
              <td>{{ getUnidadNombre(p.unit) }}</td>
              <td>{{ p.weight }} kg</td>
              <td>
                <span class="stock-display" :class="getStockClass(p.stock)">
                  {{ p.stock !== undefined ? p.stock : 'N/A' }}
                </span>
              </td>
              <td>
                <StatusBadge v-bind="getStockStatusBadge(p.stock)" />
              </td>
              <td class="action-buttons">
                <Tooltip text="Editar producto">
                  <button class="btn-icon btn-edit" @click.prevent="openEditModal(p.producto_id || p.id)">
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
        <!-- Paginación similar a clientes -->
        <div v-if="allProductos.length > 0" class="pagination-container">
          <div class="pagination-info">
            <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalFiltered }} productos</span>
          </div>
          <div class="pagination-controls">
            <button class="btn-secondary" @click="previousPage" :disabled="currentPage === 1">← Anterior</button>
            <div class="page-indicator">
              <label for="page-input">Página:</label>
              <input id="page-input" v-model.number="currentPage" @change="goToPage" type="number" :min="1" :max="totalPages" class="page-input" />
              <span>de {{ totalPages }}</span>
            </div>
            <button class="btn-secondary" @click="nextPage" :disabled="currentPage === totalPages || totalPages === 0">Siguiente →</button>
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
      :item-count="totalFiltered"
      @close="importExportDialog.show = false"
      @import-complete="handleImportComplete"
    />

    <ProductoFormModal
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
import Notification from '../components/Notification.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import ProductoFormModal from '../components/ProductoFormModal.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { getStockStatus } from '../utils/statusUtils'
import '../assets/styles/Clientes.css'
import productosService from '../services/productosService'
import unidadesService from '../services/unidadesService'
import categoriasService from '../services/categoriasService'

export default {
  name: 'ProductosListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, Notification, ImportExportDialog, ProductoFormModal, StatusBadge },
  
  data() {
    return {
      search: '',
      productos: [],
      allProductos: [],
      unidades: [], // Lista de unidades para mapeo
      loading: false,
      error: '',
      sortField: null,
      sortOrder: 'asc',
      currentPage: 1,
      pageSize: 20,
      totalProductos: 0,
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
      ,
      // Modal/form state
      showFormModal: false,
      formEditId: null
    }
  },

  created() {
    this.fetchProductos()
    this.fetchUnidades()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.allProductos
      return this.allProductos.filter(p =>
        String(p.producto_id || p.id).toLowerCase().includes(q) ||
        (p.product_code || '').toLowerCase().includes(q) ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    },

    sortedAndFiltered() {
      const data = [...this.filtered]
      if (!this.sortField) return data
      return data.sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]
        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''
        if (['producto_id','weight'].includes(this.sortField)) {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        if (this.sortOrder === 'asc') return aStr.localeCompare(bStr, 'es', { numeric: true })
        return bStr.localeCompare(aStr, 'es', { numeric: true })
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
        // Cargar TODOS los productos (paginación por backend)
        let allData = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const res = await productosService.getProductos({ page, page_size: 100 })
          if (res.results) {
            allData = allData.concat(res.results)
            this.totalProductos = res.count || allData.length
            hasMore = !!res.next
            page++
          } else {
            allData = Array.isArray(res) ? res : []
            this.totalProductos = allData.length
            hasMore = false
          }
        }

        this.allProductos = allData
        this.productos = allData
        this.currentPage = 1
      } catch (e) {
        console.error('Error al listar productos', e)
        this.error = 'No se pudo cargar la lista de productos.'
      } finally {
        this.loading = false
      }
    },

    onSearch() {},

    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
    },

    previousPage() {
      if (this.currentPage > 1) this.currentPage--
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++
    },

    goToPage() {
      if (this.currentPage < 1) this.currentPage = 1
      else if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
    },

    changePageSize() {
      this.currentPage = 1
    },

    clearSearch() {
      this.search = ''
      this.$nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      })
    },

    getStockClass(stock) {
      if (stock === 0 || stock === null) return 'stock-danger'
      if (stock <= 10) return 'stock-warning'
      if (stock <= 20) return 'stock-info'
      return 'stock-success'
    },

    getStockStatusBadge(stock) {
      return getStockStatus(stock, 10)
    },

    reload() {
      this.currentPage = 1
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

      // Cargar unidades si no están cargadas
      if (this.unidades.length === 0) {
        try {
          const response = await unidadesService.getUnidades()
          this.unidades = response.results || response
        } catch (e) {
          console.error('Error al cargar unidades:', e)
          // Usar valores por defecto si falla
          this.unidades = [
            { id: 2, symbol: 'kg', name: 'Kilogramo' },
            { id: 3, symbol: 'g', name: 'Gramo' },
            { id: 4, symbol: 'l', name: 'Litro' },
            { id: 5, symbol: 'ml', name: 'Mililitro' },
            { id: 6, symbol: 'u', name: 'Unidad' }
          ]
        }
      }

      // Cargar categorías
      let categorias = []
      try {
        const response = await categoriasService.getCategoriasByTipo('PRODUCT')
        categorias = Array.isArray(response) ? response : response.results || []
      } catch (e) {
        console.error('Error al cargar categorías:', e)
      }

      for (const item of importedData) {
        try {
          // El item ya viene normalizado desde ImportExportDialog.parseExcel()
          // pero lo normalizamos de nuevo por seguridad
          const normalizedItem = {}
          for (const [key, value] of Object.entries(item)) {
            const lowerKey = key.toLowerCase().trim()
            normalizedItem[lowerKey] = value
          }
          
          console.log('📋 Item normalizado:', normalizedItem)
          console.log('🔑 Claves disponibles:', Object.keys(normalizedItem))
          
          // Convertir texto de unidad a ID
          const unitId = unidadesService.mapTextToId(
            normalizedItem.unidad || normalizedItem.unit || normalizedItem.peso, 
            this.unidades
          )
          
          // Buscar categoría - las claves ya están normalizadas a minúsculas
          let categoriaId = null
          let categoriaNombre = (
            normalizedItem.categoría ||      // Por si tiene tilde
            normalizedItem.categoria ||      // Sin tilde (probablemente esto)
            normalizedItem.category ||       // Inglés
            ''
          )
          categoriaNombre = String(categoriaNombre || '').trim()
          
          console.log('🔍 Buscando categoría:', {
            categoriaNombre,
            categoriasDisponibles: categorias.map(c => c.nombre),
            todasLasClaves: normalizedItem
          })

          if (categoriaNombre) {
            const categoria = categorias.find(c => 
              c.nombre.toLowerCase() === categoriaNombre.toLowerCase()
            )
            categoriaId = categoria ? categoria.id : null
            
            if (!categoriaId) {
              console.warn(`⚠️ Categoría "${categoriaNombre}" no encontrada en:`, categorias)
            }
          }

          if (!categoriaId) {
            throw new Error(`Categoría no encontrada: "${categoriaNombre}". Categorías disponibles: ${categorias.map(c => c.nombre).join(', ')}`)
          }
          
          const cleanData = {
            product_code: String(normalizedItem.código || normalizedItem.product_code || '').trim(),
            name: String(normalizedItem.nombre || normalizedItem.name || '').trim(),
            description: String(normalizedItem.descripción || normalizedItem.description || '').trim(),
            categoria_id: categoriaId,
            unit: unitId,
            weight: parseFloat(normalizedItem.peso || normalizedItem.weight) || 0.1,
            stock: parseFloat(normalizedItem.stock) || 0
          }
          
          console.log('✅ Importando producto:', {
            categoriaNombre: categoriaNombre,
            categoriaId: categoriaId,
            cleanData: cleanData
          })
          
          await productosService.createProducto(cleanData)
          successCount++
        } catch (e) {
          console.error('❌ Error al importar producto:', {
            item: item,
            error: e.message,
            response: e.response?.data
          })
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
        isUpdate ? '✅ Producto actualizado' : '✅ Producto creado', 
        isUpdate ? 'El producto se actualizó correctamente' : 'El producto se guardó exitosamente'
      )
      this.currentPage = 1
      this.fetchProductos()
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
