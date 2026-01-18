<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">Detalles del Lote de Producción</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la lista">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Actualizar datos">
          <button class="btn-secondary" @click="loadLote">Refrescar</button>
        </Tooltip>
        <Tooltip text="Editar lote">
          <button class="btn-secondary" @click="openEditModal">Editar</button>
        </Tooltip>
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="content-box">
      <div class="content-body">
        <div class="loading-state">Cargando detalles del lote...</div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="lote" class="content-grid">
      <!-- Tarjeta de información del lote -->
      <div class="info-card">
        <div class="card-header">
          <h2>{{ lote.batch_code }}</h2>
          <span :class="['badge', `badge-${lote.status}`]">{{ getStatusLabel(lote.status) }}</span>
        </div>

        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Producto</span>
              <span class="info-value">{{ lote.product_name || lote.product }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha Producción</span>
              <span class="info-value">{{ formatDate(lote.production_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cantidad Producida</span>
              <span class="info-value"><strong>{{ formatNumber(lote.produced_quantity) }}</strong> {{ getUnitSymbol(lote.unit) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gestor Responsable</span>
              <span class="info-value">{{ lote.production_manager_name || `Gestor ${lote.production_manager}` }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Creado</span>
              <span class="info-value">{{ formatDateTime(lote.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Última Actualización</span>
              <span class="info-value">{{ formatDateTime(lote.updated_at) }}</span>
            </div>
          </div>

          <!-- Cambio de estado -->
          <div class="status-changer">
            <label>Cambiar Estado:</label>
            <div class="status-buttons">
              <button
                v-for="status in estatuses"
                :key="status.value"
                class="btn-status"
                :class="{ active: lote.status === status.value }"
                @click="changeStatus(status.value)"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de materiales utilizados -->
      <div class="materials-card">
        <div class="card-header">
          <h3>Materiales Utilizados</h3>
          <button class="btn-primary" @click="openAddMaterialModal">+ Agregar Material</button>
        </div>

        <div class="card-body">
          <div v-if="loading" class="loading-state">Cargando materiales...</div>
          <div v-else-if="materiales.length === 0" class="empty-state">
            <div class="empty-icon">📦</div>
            <h4>No hay materiales registrados</h4>
            <p>Agrega los materiales que se utilizaron en este lote</p>
          </div>

          <table v-else class="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Materia Prima</th>
                <th class="text-right">Cantidad Usada</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="material in materiales" :key="material.id">
                <td>{{ material.raw_material_codigo }}</td>
                <td>{{ material.raw_material_name }}</td>
                <td class="text-right"><strong>{{ formatNumber(material.used_quantity) }}</strong></td>
                <td>{{ getUnitSymbolById(material.unit) }}</td>
                <td>
                  <span :class="[
                    'badge-stock',
                    material.raw_material_stock < material.raw_material_stock_minimo ? 'low' : 'normal'
                  ]">
                    {{ formatNumber(material.raw_material_stock) }}
                  </span>
                </td>
                <td class="action-buttons">
                  <Tooltip text="Editar material">
                    <button class="btn-icon btn-edit" @click="openEditMaterialModal(material.id)" aria-label="Editar">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                  </Tooltip>
                  <Tooltip text="Eliminar material">
                    <button class="btn-icon btn-delete" @click="deleteMaterial(material.id)" aria-label="Eliminar">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </Tooltip>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Resumen de materiales -->
          <div v-if="materiales.length > 0" class="materials-summary">
            <div class="summary-item">
              <span>Total de Materiales:</span>
              <strong>{{ materiales.length }}</strong>
            </div>
            <div class="summary-item">
              <span>Materiales con Stock Bajo:</span>
              <strong class="text-warning">{{ materialesStockBajo }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else class="content-box">
      <div class="content-body">
        <div class="alert-error">Lote no encontrado</div>
        <button class="btn-primary" @click="$router.back()">Volver</button>
      </div>
    </div>

    <!-- Modales -->
    <LoteFormModal 
      :show="showLoteModal" 
      :lote-id="loteId"
      @close="showLoteModal = false" 
      @saved="handleLoteSaved"
    />

    <MaterialProduccionFormModal 
      :show="showMaterialModal" 
      :lote-id="loteId"
      :material-id="selectedMaterialId"
      @close="showMaterialModal = false" 
      @saved="handleMaterialSaved"
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
import { useRoute } from 'vue-router'
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import LoteFormModal from '../components/LoteFormModal.vue'
import MaterialProduccionFormModal from '../components/MaterialProduccionFormModal.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Notification from '../components/Notification.vue'
import loteProduccionService from '../services/loteProduccionService'
import '../assets/styles/LotesProduccion.css'

const route = useRoute()
const loteId = route.params.id

// Estado
const loading = ref(false)
const lote = ref(null)
const materiales = ref([])
const unidades = ref([])
const showLoteModal = ref(false)
const showMaterialModal = ref(false)
const selectedMaterialId = ref(null)

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

// Computed
const materialesStockBajo = computed(() => {
  return materiales.value.filter(
    m => m.raw_material_stock < m.raw_material_stock_minimo
  ).length
})

// Métodos de utilidad
const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendiente',
    'in_progress': 'En Proceso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  }
  return labels[status] || status
}

const getUnitSymbol = (unitId) => {
  const unit = unidades.value.find(u => u.id === unitId)
  return unit ? unit.simbolo : 'UN'
}

const getUnitSymbolById = (unitId) => {
  return getUnitSymbol(unitId)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-ES')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES')
}

const formatNumber = (num) => {
  if (!num) return '0.00'
  return parseFloat(num).toFixed(2)
}

// Métodos principales
const loadLote = async () => {
  try {
    loading.value = true
    lote.value = await loteProduccionService.getLoteProduccion(loteId)
    loadUnidades()
  } catch (err) {
    console.error('Error cargando lote:', err)
    showNotification('Error al cargar el lote', 'error')
  } finally {
    loading.value = false
  }
}

const loadMateriales = async () => {
  try {
    const data = await loteProduccionService.getMaterialesByLote(loteId)
    materiales.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando materiales:', err)
    showNotification('Error al cargar los materiales', 'error')
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
    loadMateriales()
  } catch (err) {
    console.error('Error cargando unidades:', err)
  }
}

// Acciones
const openEditModal = () => {
  showLoteModal.value = true
}

const openAddMaterialModal = () => {
  selectedMaterialId.value = null
  showMaterialModal.value = true
}

const openEditMaterialModal = (materialId) => {
  selectedMaterialId.value = materialId
  showMaterialModal.value = true
}

const handleLoteSaved = () => {
  loadLote()
  showNotification('Lote actualizado correctamente', 'success')
}

const handleMaterialSaved = () => {
  loadMateriales()
  showNotification(selectedMaterialId.value ? 'Material actualizado' : 'Material agregado', 'success')
}

const changeStatus = (newStatus) => {
  confirmDialog.value = {
    title: 'Cambiar Estado',
    message: `¿Cambiar el estado a ${getStatusLabel(newStatus)}?`,
    confirmText: 'Cambiar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        await loteProduccionService.updateLoteStatus(loteId, newStatus)
        loadLote()
        showNotification('Estado actualizado correctamente', 'success')
      } catch (err) {
        console.error('Error cambiando estado:', err)
        showNotification('Error al cambiar el estado', 'error')
      }
      confirmDialog.value = {}
    }
  }
}

const deleteMaterial = (materialId) => {
  confirmDialog.value = {
    title: 'Eliminar Material',
    message: '¿Estás seguro de que deseas eliminar este material del lote?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        await loteProduccionService.deleteMaterialFromLote(loteId, materialId)
        loadMateriales()
        showNotification('Material eliminado correctamente', 'success')
      } catch (err) {
        console.error('Error eliminando material:', err)
        showNotification('Error al eliminar el material', 'error')
      }
      confirmDialog.value = {}
    }
  }
}

const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type }
}

// Lifecycle
onMounted(() => {
  loadLote()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #EEF3F9, #F8FAFC);
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  margin: 24px auto 20px;
  width: 95%;
  max-width: 1200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #E5E7EB;
}

.topbar-title {
  font-size: 24px;
  font-weight: 600;
  color: #374151;
}

.topbar-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover {
  background: #2563EB;
}

.btn-secondary {
  background: #E5E7EB;
  color: #374151;
}

.btn-secondary:hover {
  background: #D1D5DB;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin: 0 auto 40px;
  width: 95%;
  max-width: 1200px;
}

.info-card,
.materials-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #E5E7EB;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.card-header h2,
.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-pending { background: #FEF3C7; color: #92400E; }
.badge-in_progress { background: #DBEAFE; color: #1E40AF; }
.badge-completed { background: #DCFCE7; color: #166534; }
.badge-cancelled { background: #FEE2E2; color: #991B1B; }

.card-body {
  padding: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #374151;
}

.status-changer {
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.status-changer label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.status-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-status {
  padding: 8px 12px;
  border: 2px solid #D1D5DB;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-status:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.btn-status.active {
  background: #3B82F6;
  border-color: #3B82F6;
  color: white;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead {
  background: #F9FAFB;
  border-bottom: 2px solid #E5E7EB;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
}

.table tbody tr {
  border-bottom: 1px solid #E5E7EB;
}

.table tbody tr:hover {
  background: #F9FAFB;
}

.table td {
  padding: 14px 16px;
  color: #374151;
}

.badge-stock {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-stock.normal {
  background: #DCFCE7;
  color: #166534;
}

.badge-stock.low {
  background: #FEE2E2;
  color: #991B1B;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s ease;
  color: #6B7280;
}

.btn-edit:hover { background: #FEF3C7; color: #92400E; }
.btn-delete:hover { background: #FEE2E2; color: #991B1B; }

.materials-summary {
  display: flex;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
  margin-top: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.text-warning {
  color: #EA580C;
}

.text-right {
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6B7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #6B7280;
}

.alert-error {
  background: #FEE2E2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .content-grid {
    width: 100%;
    padding: 0 16px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 12px;
  }
}
</style>
