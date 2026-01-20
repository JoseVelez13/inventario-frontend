<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Recepciones de Material
        <span class="chip" aria-live="polite" title="Total de recepciones">
          <template v-if="!loading">{{ totalRecepciones }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de recepciones">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Exportar recepciones a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Registrar nueva recepción de material">
          <button class="btn-primary" @click="openCreateModal">Nueva Recepción</button>
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
            placeholder="Buscar por factura, materia prima o proveedor..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando recepciones...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay recepciones registradas</h3>
          <p>Comienza registrando tu primera recepción de material</p>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Materia Prima</th>
              <th>Proveedor</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Costo Unit.</th>
              <th class="text-right">Total</th>
              <th>Almacén</th>
              <th>N° Factura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="recepcion in paginatedRecepciones" :key="recepcion.id">
              <td>{{ recepcion.id }}</td>
              <td>{{ formatDate(recepcion.fecha_recepcion) }}</td>
              <td>
                <div class="item-info">
                  <span class="item-codigo">{{ recepcion.materia_prima_codigo || recepcion.materia_prima }}</span>
                  <span class="item-nombre">{{ recepcion.materia_prima_nombre }}</span>
                </div>
              </td>
              <td>{{ recepcion.proveedor_nombre || recepcion.proveedor }}</td>
              <td class="text-right">{{ formatNumber(recepcion.cantidad) }}</td>
              <td class="text-right">${{ formatNumber(recepcion.costo_unitario) }}</td>
              <td class="text-right"><strong>${{ formatTotal(recepcion) }}</strong></td>
              <td>{{ recepcion.almacen_nombre || `Almacén ${recepcion.almacen}` }}</td>
              <td>{{ recepcion.numero_factura || '-' }}</td>
              <td class="action-buttons">
                <Tooltip text="Ver detalles">
                  <button class="btn-icon btn-view" @click="viewRecepcion(recepcion)" aria-label="Ver">
                    <i class="fa-solid fa-eye"></i>
                  </button>
                </Tooltip>
                <Tooltip text="Editar recepción">
                  <button class="btn-icon btn-edit" @click="openEditModal(recepcion.id)" aria-label="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar recepción">
                  <button class="btn-icon btn-delete" @click="deleteRecepcion(recepcion.id)" aria-label="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="filtered.length > 0" class="pagination">
          <button 
            class="pagination-button" 
            :disabled="currentPage === 1" 
            @click="goToPage(currentPage - 1)"
          >
            Anterior
          </button>
          <span class="pagination-info">
            Página {{ currentPage }} de {{ totalPages }} ({{ totalRecepciones }} recepciones)
          </span>
          <button 
            class="pagination-button" 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Recepción -->
    <RecepcionMaterialFormModal
      :visible="showModal"
      :recepcion-id="selectedRecepcionId"
      @close="closeModal"
      @saved="handleSaved"
      @error="handleError"
    />

    <!-- Modal de Confirmación -->
    <ConfirmDialog
      :visible="showConfirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="confirmDialog.onConfirm"
      @cancel="showConfirmDialog = false"
    />

    <!-- Notification -->
    <Notification 
      :show="notification.show" 
      :title="notification.title"
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
import RecepcionMaterialFormModal from '../components/RecepcionMaterialFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Notification from '../components/Notification.vue'
import Tooltip from '../components/Tooltip.vue'
import recepcionesService from '../services/recepcionesService'
import '../assets/styles/Dashboard.css'

// Estado reactivo
const recepciones = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(15)
const showModal = ref(false)
const selectedRecepcionId = ref(null)
const showConfirmDialog = ref(false)

const confirmDialog = ref({
  title: '',
  message: '',
  onConfirm: () => {}
})

const notification = ref({
  show: false,
  title: '',
  message: '',
  type: 'success'
})

// Computed
const totalRecepciones = computed(() => recepciones.value.length)

const filtered = computed(() => {
  if (!search.value) return recepciones.value
  
  const searchLower = search.value.toLowerCase()
  return recepciones.value.filter(r => 
    r.numero_factura?.toLowerCase().includes(searchLower) ||
    r.materia_prima?.toLowerCase().includes(searchLower) ||
    r.materia_prima_nombre?.toLowerCase().includes(searchLower) ||
    r.materia_prima_codigo?.toLowerCase().includes(searchLower) ||
    r.proveedor?.toLowerCase().includes(searchLower) ||
    r.proveedor_nombre?.toLowerCase().includes(searchLower)
  )
})

const paginatedRecepciones = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filtered.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filtered.value.length / itemsPerPage.value)
})

// Métodos
const loadRecepciones = async () => {
  try {
    loading.value = true
    error.value = null
    recepciones.value = await recepcionesService.getRecepcionesMaterial()
  } catch (err) {
    console.error('Error cargando recepciones:', err)
    error.value = 'No se pudo cargar las recepciones de material.'
    showNotification('Error al cargar las recepciones', 'error')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  console.log('🔵 Abriendo modal de nueva recepción')
  selectedRecepcionId.value = null
  showModal.value = true
  console.log('🔵 showModal.value:', showModal.value)
}

const openEditModal = (id) => {
  selectedRecepcionId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedRecepcionId.value = null
}

const handleSaved = () => {
  loadRecepciones()
  showNotification('Recepción guardada correctamente', 'success')
}

const handleError = (errorMsg) => {
  console.log('❌ Error recibido desde modal:', errorMsg)
  notification.value = {
    show: true,
    type: 'error',
    title: 'Error al guardar',
    message: errorMsg
  }
  console.log('Mostrando notificación de error:', notification.value)
}

const viewRecepcion = (recepcion) => {
  const details = `
    ID: ${recepcion.id}
    Fecha: ${formatDate(recepcion.fecha_recepcion)}
    Materia Prima: ${recepcion.materia_prima_nombre || recepcion.materia_prima}
    Proveedor: ${recepcion.proveedor_nombre || recepcion.proveedor}
    Cantidad: ${formatNumber(recepcion.cantidad)}
    Costo Unitario: $${formatNumber(recepcion.costo_unitario)}
    Total: $${formatTotal(recepcion)}
    Almacén: ${recepcion.almacen_nombre || recepcion.almacen}
    N° Factura: ${recepcion.numero_factura || '-'}
    Observaciones: ${recepcion.observaciones || '-'}
  `
  alert(details)
}

const deleteRecepcion = (id) => {
  confirmDialog.value = {
    title: 'Eliminar Recepción',
    message: '¿Estás seguro de que deseas eliminar esta recepción? Esta acción no se puede deshacer.',
    onConfirm: async () => {
      try {
        await recepcionesService.deleteRecepcionMaterial(id)
        showNotification('Recepción eliminada correctamente', 'success')
        loadRecepciones()
      } catch (err) {
        console.error('Error eliminando recepción:', err)
        showNotification('Error al eliminar la recepción', 'error')
      } finally {
        showConfirmDialog.value = false
      }
    }
  }
  showConfirmDialog.value = true
}

const onSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  search.value = ''
  currentPage.value = 1
}

const reload = () => {
  loadRecepciones()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const openExport = () => {
  showNotification('Funcionalidad de exportación en desarrollo', 'info', 'Información')
}

const showNotification = (message, type = 'success', title = '') => {
  if (!title) {
    title = type === 'success' ? 'Éxito' : 
            type === 'error' ? 'Error' : 
            type === 'warning' ? 'Advertencia' : 'Información'
  }
  notification.value = { show: true, message, type, title }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES')
}

const formatNumber = (num) => {
  if (!num) return '0.00'
  return parseFloat(num).toFixed(2)
}

const formatTotal = (recepcion) => {
  const total = parseFloat(recepcion.cantidad) * parseFloat(recepcion.costo_unitario)
  return total.toFixed(2)
}

// Lifecycle
onMounted(() => {
  loadRecepciones()
})
</script>

<style scoped>
.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-codigo {
  font-size: 11px;
  color: #6B7280;
  font-family: monospace;
}

.item-nombre {
  font-size: 13px;
  font-weight: 500;
}

.text-right {
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6B7280;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6B7280;
}

.alert-error {
  background: #FEE2E2;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>
