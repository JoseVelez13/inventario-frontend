<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="topbar">
      <div class="topbar-title">Gestión de Lotes de Producción</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de lotes">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Exportar lotes a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo lote de producción">
          <button class="btn-primary" @click="openCreateModal">Nuevo Lote</button>
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
            placeholder="Buscar por código, producto, almacén o estado..." 
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
        <!-- Estados de carga -->
        <div v-if="loading" class="loading-state">Cargando lotes de producción...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay lotes de producción</h3>
          <p>{{ search ? 'No se encontraron resultados para tu búsqueda' : 'Comienza creando tu primer lote' }}</p>
        </div>

        <!-- Tabla de lotes -->
        <table v-else class="table">
          <thead>
            <tr>
              <th>Código Lote</th>
              <th>Producto</th>
              <th>Almacén</th>
              <th>Fecha Producción</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Costo Mat.</th>
              <th class="text-right">Costo Unit.</th>
              <th class="text-center">Materiales</th>
              <th>Estado</th>
              <th>Gestor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lote in paginatedLotes" :key="lote.id">
              <td>
                <div class="item-info">
                  <span class="item-codigo">{{ lote.batch_code }}</span>
                </div>
              </td>
              <td>
                <div class="product-info">
                  <strong>{{ lote.product_name || lote.product }}</strong>
                  <small v-if="lote.product_code">{{ lote.product_code }}</small>
                </div>
              </td>
              <td>
                <span class="almacen-badge">{{ lote.almacen_name || 'N/A' }}</span>
              </td>
              <td>{{ formatDate(lote.production_date) }}</td>
              <td class="text-right">
                <strong>{{ formatQuantity(lote.produced_quantity) }}</strong>
                <small>{{ lote.unit_symbol || getUnitSymbol(lote.unit) }}</small>
              </td>
              <td class="text-right">
                <span class="cost-value">${{ formatCost(lote.costo_materiales) }}</span>
              </td>
              <td class="text-right">
                <span class="cost-value">${{ formatCost(lote.costo_unitario_producto) }}</span>
              </td>
              <td class="text-center">
                <span class="badge-count">{{ lote.total_materiales || 0 }}</span>
              </td>
              <td>
                <span :class="['badge', `badge-${lote.status}`]">
                  {{ getStatusLabel(lote.status) }}
                </span>
              </td>
              <td>{{ lote.production_manager_name || `Gestor ${lote.production_manager}` }}</td>
              <td class="action-buttons">
                <Tooltip text="Ver detalles y materiales">
                  <button class="btn-icon btn-view" @click="viewLote(lote)" aria-label="Ver">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </Tooltip>
                <Tooltip text="Editar lote">
                  <button class="btn-icon btn-edit" @click="openEditModal(lote.id)" aria-label="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar lote">
                  <button class="btn-icon btn-delete" @click="deleteLote(lote.id)" aria-label="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="filtered.length > 0">
            <tr class="summary-row">
              <td colspan="5" class="text-right"><strong>Totales:</strong></td>
              <td class="text-right">
                <strong>${{ formatCost(totalCostoMateriales) }}</strong>
              </td>
              <td colspan="5"></td>
            </tr>
          </tfoot>
        </table>

        <!-- Paginación -->
        <div v-if="filtered.length > 0" class="pagination-container">
          <span class="pagination-info">
            Mostrando {{ startItem }} a {{ endItem }} de {{ filtered.length }}
          </span>
          <div class="pagination-buttons">
            <button 
              class="btn-page" 
              @click="previousPage"
              :disabled="currentPage === 1"
            >
              Anterior
            </button>
            <button 
              v-for="page in visiblePages"
              :key="page"
              class="btn-page"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button 
              class="btn-page" 
              @click="nextPage"
              :disabled="currentPage === totalPages"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de formulario -->
    <LoteFormModal 
      :show="showModal" 
      :lote-id="selectedLoteId"
      @close="closeModal" 
      @saved="handleSaved"
    />

    <!-- Dialog de confirmación -->
    <ConfirmDialog 
      v-if="confirmDialog.title"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :confirm-text="confirmDialog.confirmText"
      :cancel-text="confirmDialog.cancelText"
      @confirm="confirmDialog.onConfirm"
      @cancel="confirmDialog = {}"
    />

    <!-- Notificación -->
    <Notification 
      v-if="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="notification.show = false"
    />

    <!-- Modal de Import/Export -->
    <ImportExportDialog
      :visible="importExportDialog.show"
      :mode="importExportDialog.mode"
      :columns="exportColumns"
      :data="filtered"
      :filename="'lotes_produccion'"
      entity-name="Lotes"
      @close="importExportDialog.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import LoteFormModal from '../components/LoteFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Notification from '../components/Notification.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import loteProduccionService from '../services/loteProduccionService'
import '../assets/styles/LotesProduccion.css'

const router = useRouter()

// Estado
const loading = ref(false)
const error = ref('')
const search = ref('')
const searchInput = ref('')
const statusFilter = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const lotes = ref([])
const showModal = ref(false)
const selectedLoteId = ref(null)
const unidades = ref([])

// Estados disponibles
const estatuses = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' }
]

// Dialog y notificaciones
const confirmDialog = ref({})
const notification = ref({ show: false, message: '', type: 'success' })

// Import/Export
const importExportDialog = ref({ show: false, mode: 'export' })
const exportColumns = ref([
  { key: 'codigo_lote', label: 'Código Lote' },
  { key: 'producto_nombre', label: 'Producto' },
  { key: 'almacen_nombre', label: 'Almacén' },
  { key: 'fecha_produccion', label: 'Fecha Producción' },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'costo_materiales', label: 'Costo Materiales' },
  { key: 'costo_unitario', label: 'Costo Unitario' },
  { key: 'estado', label: 'Estado' },
  { key: 'notas', label: 'Notas' }
])

// Métodos de filtrado
const filtered = computed(() => {
  let result = lotes.value

  // Filtrar por estado
  if (statusFilter.value) {
    result = result.filter(l => l.status === statusFilter.value)
  }

  // Filtrar por búsqueda
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    result = result.filter(l =>
      l.batch_code?.toLowerCase().includes(searchLower) ||
      l.product_name?.toLowerCase().includes(searchLower) ||
      l.almacen_name?.toLowerCase().includes(searchLower) ||
      l.production_manager_name?.toLowerCase().includes(searchLower)
    )
  }

  return result
})

const activeChips = computed(() => {
  const chips = []
  if (search.value) chips.push({ key: 'search', label: `Buscar: "${search.value}"` })
  return chips
})

const totalCostoMateriales = computed(() => {
  return filtered.value.reduce((sum, lote) => {
    return sum + parseFloat(lote.costo_materiales || 0)
  }, 0)
})

// Paginación
const paginatedLotes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage.value))

const startItem = computed(() => {
  if (filtered.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value
  return Math.min(end, filtered.value.length)
})

const visiblePages = computed(() => {
  const delta = 2
  const left = Math.max(1, currentPage.value - delta)
  const right = Math.min(totalPages.value, currentPage.value + delta)
  const pages = []
  for (let i = left; i <= right; i++) {
    pages.push(i)
  }
  return pages
})

// Métodos principales
const loadLotes = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await loteProduccionService.getLotesProduccion()
    lotes.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando lotes:', err)
    error.value = 'No se pudo cargar los lotes de producción.'
    showNotification('Error al cargar los lotes', 'error')
  } finally {
    loading.value = false
  }
}

const loadUnidades = async () => {
  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch('http://localhost:8000/api/v1/unidades/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    unidades.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando unidades:', err)
  }
}

const getUnitSymbol = (unitId) => {
  const unit = unidades.value.find(u => u.id === unitId)
  return unit ? unit.simbolo : 'UN'
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendiente',
    'in_progress': 'En Proceso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const formatQuantity = (num) => {
  if (!num) return '0.0000'
  return parseFloat(num).toFixed(4)
}

const formatCost = (num) => {
  if (!num) return '0.00'
  return parseFloat(num).toFixed(2)
}

// Acciones de CRUD
const openExport = () => {
  importExportDialog.value.show = true
  importExportDialog.value.mode = 'export'
}

const openCreateModal = () => {
  selectedLoteId.value = null
  showModal.value = true
}

const openEditModal = (id) => {
  selectedLoteId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedLoteId.value = null
}

const handleSaved = () => {
  loadLotes()
  showNotification('Lote guardado correctamente', 'success')
}

const viewLote = (lote) => {
  router.push(`/lotes-produccion/${lote.id}`)
}

const deleteLote = (id) => {
  confirmDialog.value = {
    title: 'Eliminar Lote',
    message: '¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        await loteProduccionService.deleteLoteProduccion(id)
        showNotification('Lote eliminado correctamente', 'success')
        loadLotes()
      } catch (err) {
        console.error('Error eliminando lote:', err)
        showNotification('Error al eliminar el lote', 'error')
      }
      confirmDialog.value = {}
    }
  }
}

// Utilidades de búsqueda y paginación
const debouncedSearch = (() => {
  let timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      search.value = searchInput.value
      currentPage.value = 1
    }, 300)
  }
})()

const clearSearch = () => {
  search.value = ''
  searchInput.value = ''
  currentPage.value = 1
}

const removeChip = (key) => {
  if (key === 'search') clearSearch()
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const reload = () => {
  loadLotes()
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
}

// Lifecycle
onMounted(() => {
  loadLotes()
  loadUnidades()
})
</script>

<style scoped>
.text-right {
  text-align: right;
}
.text-center {
  text-align: center;
}
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
.product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.product-info strong {
  color: #374151;
}
.product-info small {
  color: #6B7280;
  font-size: 12px;
}
.almacen-badge {
  background: #DBEAFE;
  color: #1E40AF;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.cost-value {
  color: #059669;
  font-weight: 600;
}
.badge-count {
  background: #F3F4F6;
  color: #374151;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.summary-row {
  background: #F9FAFB;
  font-weight: 600;
}
.summary-row td {
  border-top: 2px solid #E5E7EB;
  padding: 16px;
}
</style>