<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Recepciones de Productos
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
        <Tooltip text="Registrar nueva recepción de producto">
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
            placeholder="Buscar por producto o lote..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando recepciones...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay recepciones de productos registradas</h3>
          <p>Comienza registrando tu primera recepción de producto terminado</p>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th class="text-right">Cantidad</th>
              <th>Almacén</th>
              <th>Lote de Producción</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="recepcion in paginatedRecepciones" :key="recepcion.id">
              <td>{{ recepcion.id }}</td>
              <td>{{ formatDate(recepcion.fecha_recepcion) }}</td>
              <td>
                <div class="item-info">
                  <span class="item-codigo">{{ recepcion.producto_codigo || recepcion.producto }}</span>
                  <span class="item-nombre">{{ recepcion.producto_nombre }}</span>
                </div>
              </td>
              <td class="text-right"><strong>{{ formatNumber(recepcion.cantidad) }}</strong></td>
              <td>{{ recepcion.almacen_nombre || `Almacén ${recepcion.almacen}` }}</td>
              <td>
                <span class="badge badge-secondary">{{ recepcion.lote_produccion || '-' }}</span>
              </td>
              <td>{{ truncate(recepcion.observaciones) }}</td>
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
    <RecepcionItemFormModal
      :visible="showModal"
      :recepcion-id="selectedRecepcionId"
      @close="closeModal"
      @saved="handleSaved"
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
import RecepcionItemFormModal from '../components/RecepcionItemFormModal.vue'
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
  message: '',
  type: 'success'
})

// Computed
const totalRecepciones = computed(() => recepciones.value.length)

const filtered = computed(() => {
  if (!search.value) return recepciones.value
  
  const searchLower = search.value.toLowerCase()
  return recepciones.value.filter(r => 
    r.producto?.toString().toLowerCase().includes(searchLower) ||
    r.producto_nombre?.toLowerCase().includes(searchLower) ||
    r.producto_codigo?.toLowerCase().includes(searchLower) ||
    r.lote_produccion?.toLowerCase().includes(searchLower)
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
    recepciones.value = await recepcionesService.getRecepcionesItem()
  } catch (err) {
    console.error('Error cargando recepciones:', err)
    error.value = 'No se pudo cargar las recepciones de productos.'
    showNotification('Error al cargar las recepciones', 'error')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  selectedRecepcionId.value = null
  showModal.value = true
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

const viewRecepcion = (recepcion) => {
  const details = `
    ID: ${recepcion.id}
    Fecha: ${formatDate(recepcion.fecha_recepcion)}
    Producto: ${recepcion.producto_nombre || recepcion.producto}
    Cantidad: ${formatNumber(recepcion.cantidad)}
    Almacén: ${recepcion.almacen_nombre || recepcion.almacen}
    Lote de Producción: ${recepcion.lote_produccion || '-'}
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
        await recepcionesService.deleteRecepcionItem(id)
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
  showNotification('Funcionalidad de exportación en desarrollo', 'info')
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
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

const truncate = (text, length = 30) => {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
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

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.badge-secondary {
  background: #E5E7EB;
  color: #374151;
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
