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
            placeholder="Buscar por código, producto o estado..." 
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
              <th>Fecha Producción</th>
              <th class="text-right">Cantidad</th>
              <th>Unidad</th>
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
              <td>{{ lote.product_name || lote.product }}</td>
              <td>{{ formatDate(lote.production_date) }}</td>
              <td class="text-right"><strong>{{ formatNumber(lote.produced_quantity) }}</strong></td>
              <td>{{ getUnitSymbol(lote.unit) }}</td>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import LoteFormModal from '../components/LoteFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Notification from '../components/Notification.vue'
import loteProduccionService from '../services/loteProduccionService'
import '../assets/styles/LotesProduccion.css'

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

const countByStatus = (status) => {
  return lotes.value.filter(l => l.status === status).length
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const formatNumber = (num) => {
  if (!num) return '0'
  return Math.round(parseFloat(num)).toLocaleString('es-ES')
}

// Acciones de CRUD
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
  const details = `
    ID: ${lote.id}
    Código Lote: ${lote.batch_code}
    Producto: ${lote.product_name || lote.product}
    Fecha: ${formatDate(lote.production_date)}
    Cantidad: ${formatNumber(lote.produced_quantity)} ${getUnitSymbol(lote.unit)}
    Estado: ${getStatusLabel(lote.status)}
    Gestor: ${lote.production_manager_name || `Gestor ${lote.production_manager}`}
  `
  alert(details)
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
  return (callback) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback()
    }, 300)
  }
})()

const onSearch = () => {
  currentPage.value = 1
}

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
