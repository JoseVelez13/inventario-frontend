<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Materias Primas
        <span class="chip" aria-live="polite" title="Total de materias primas">
          <template v-if="!loading">{{ totalMateriasPrimas }}</template>
          <template v-else>...</template>
        </span>
      </div>
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
import unidadesService from '../services/unidadesService'

export default {
  name: 'MateriasPrimasListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, ImportExportDialog, Notification, MateriaPrimaFormModal },
  
  data() {
    return {
      search: '',
      materiasPrimas: [],
      unidades: [],
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
      const pages = Math.ceil(this.totalMateriasPrimas / this.itemsPerPage)
      return pages > 0 ? pages : 1
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
        // Cargar TODAS las páginas de materias primas
        let allMateriasPrimas = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const data = await materiasPrimasService.getMateriasPrimas({ page, page_size: 100 })
          const items = Array.isArray(data) ? data : data.results || []
          allMateriasPrimas = [...allMateriasPrimas, ...items]
          
          // Si hay paginación, verificar si hay más páginas
          if (data.next) {
            page++
          } else {
            hasMore = false
          }
        }
        
        this.materiasPrimas = allMateriasPrimas
        console.log(`Materias primas cargadas: ${this.materiasPrimas.length}`)
        
        // Resetear a página 1 después de cargar datos
        this.currentPage = 1
      } catch (e) {
        console.error('Error al listar materias primas', e)
        this.error = 'No se pudo cargar la lista de materias primas.'
      } finally {
        this.loading = false
      }
    },

onSearch() {
  this.currentPage = 1 // Resetear a página 1 al buscar
},

clearSearch() {
  this.search = ''
  this.currentPage = 1 // Resetear a página 1 al limpiar búsqueda
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
      console.log('📥 Iniciando importación de', importedData.length, 'registros')
      let successCount = 0
      let errorCount = 0

      // PRIMERO: Cargar TODAS las materias primas del backend (todas las páginas)
      try {
        let allMateriasPrimas = []
        let page = 1
        let hasMore = true
        
        while (hasMore) {
          const data = await materiasPrimasService.getMateriasPrimas({ page, page_size: 100 })
          const items = Array.isArray(data) ? data : data.results || []
          allMateriasPrimas = [...allMateriasPrimas, ...items]
          
          console.log(`📄 Página ${page}: ${items.length} registros cargados`)
          
          // Si hay paginación, verificar si hay más páginas
          if (data.next) {
            page++
          } else {
            hasMore = false
          }
        }
        
        this.materiasPrimas = allMateriasPrimas
        console.log(`✅ Total materias primas cargadas: ${this.materiasPrimas.length}`)
        console.log('📋 Códigos existentes:', this.materiasPrimas.map(mp => mp.codigo).join(', '))
      } catch (e) {
        console.error('❌ Error al cargar materias primas:', e)
      }

      // SEGUNDO: Cargar unidades si no están cargadas
      if (this.unidades.length === 0) {
        try {
          const response = await unidadesService.getUnidades()
          this.unidades = response.results || response
        } catch (e) {
          console.error('Error al cargar unidades:', e)
          // Usar valores por defecto
          this.unidades = [
            { id: 2, symbol: 'kg', name: 'Kilogramo' },
            { id: 3, symbol: 'g', name: 'Gramo' },
            { id: 4, symbol: 'l', name: 'Litro' }
          ]
        }
      }

      // TERCERO: Procesar cada registro
      for (const materiaPrima of importedData) {
        try {
          // Convertir texto de unidad a ID
          const unidadId = unidadesService.mapTextToId(materiaPrima.unidad_text, this.unidades)
          
          const cleanData = {
            codigo: String(materiaPrima.codigo || '').trim(),
            nombre: String(materiaPrima.nombre || '').trim(),
            descripcion: String(materiaPrima.descripcion || '').trim(),
            unidad_id: unidadId,
            stock_minimo: parseInt(materiaPrima.stock_minimo) || 0
          }
          
          // Campos opcionales - solo agregar si tienen valor
          if (materiaPrima.densidad && !isNaN(parseFloat(materiaPrima.densidad))) {
            cleanData.densidad = parseFloat(materiaPrima.densidad)
          }
          
          if (materiaPrima.stock_maximo && !isNaN(parseInt(materiaPrima.stock_maximo))) {
            cleanData.stock_maximo = parseInt(materiaPrima.stock_maximo)
          }
          
          // Verificar si ya existe por código
          const existente = this.materiasPrimas.find(mp => mp.codigo === cleanData.codigo)
          
          if (existente) {
            // Actualizar la materia prima existente
            const materiaPrimaId = existente.materia_prima_id || existente.id
            console.log(`🔄 Actualizando materia prima existente: ${cleanData.codigo} (ID: ${materiaPrimaId})`)
            await materiasPrimasService.updateMateriaPrima(materiaPrimaId, cleanData)
            console.log(`✅ Materia prima actualizada: ${cleanData.codigo}`)
            successCount++
          } else {
            // Crear nueva materia prima
            console.log(`➕ Creando nueva materia prima: ${cleanData.codigo}`)
            await materiasPrimasService.createMateriaPrima(cleanData)
            console.log(`✅ Materia prima creada: ${cleanData.codigo}`)
            successCount++
          }
          
        } catch (e) {
          console.error('❌ Error al importar materia prima:', {
            codigo: materiaPrima.codigo,
            error: e.message,
            detail: e.response?.data
          })
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
