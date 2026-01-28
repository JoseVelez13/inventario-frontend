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
        <Tooltip text="Completar producción" v-if="lote && lote.status !== 'completed'">
          <button class="btn-success" @click="completarProduccion">
            <i class="fa-solid fa-check-circle"></i> Completar
          </button>
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
              <small v-if="lote.product_code">{{ lote.product_code }}</small>
            </div>
            <div class="info-item">
              <span class="info-label">Almacén</span>
              <span class="info-value">{{ lote.almacen_name || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha Producción</span>
              <span class="info-value">{{ formatDate(lote.production_date) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cantidad Producida</span>
              <span class="info-value">
                <strong>{{ formatQuantity(lote.produced_quantity) }}</strong> {{ lote.unit_symbol || getUnitSymbol(lote.unit) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">Costo de Materiales</span>
              <span class="info-value cost-highlight">${{ formatCost(lote.costo_materiales) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Costo Unitario Producto</span>
              <span class="info-value cost-highlight">${{ formatCost(lote.costo_unitario_producto) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gestor Responsable</span>
              <span class="info-value">{{ lote.production_manager_name || `Gestor ${lote.production_manager}` }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Materiales</span>
              <span class="info-value"><strong>{{ lote.total_materiales || 0 }}</strong> materiales</span>
            </div>
            <div class="info-item">
              <span class="info-label">Creado</span>
              <span class="info-value">{{ formatDateTime(lote.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Última Actualización</span>
              <span class="info-value">{{ formatDateTime(lote.updated_at) }}</span>
            </div>
            <div class="info-item" v-if="lote.completed_at">
              <span class="info-label">Completado</span>
              <span class="info-value">{{ formatDateTime(lote.completed_at) }}</span>
            </div>
          </div>

          <!-- Observaciones -->
          <div v-if="lote.observaciones" class="observaciones-section">
            <h4>Observaciones</h4>
            <p>{{ lote.observaciones }}</p>
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
                :disabled="lote.status === 'completed' && status.value !== 'completed'"
              >
                {{ status.label }}
              </button>
            </div>
            <small class="help-text" v-if="lote.status === 'completed'">
              Un lote completado no puede cambiar a otro estado
            </small>
          </div>
        </div>
      </div>

      <!-- Tarjeta de costos -->
      <div class="costs-card">
        <div class="card-header">
          <h3>Resumen de Costos</h3>
        </div>
        <div class="card-body">
          <div class="costs-grid">
            <div class="cost-item">
              <div class="cost-icon">💰</div>
              <div class="cost-details">
                <span class="cost-label">Costo Total Materiales</span>
                <span class="cost-value">${{ formatCost(lote.costo_materiales) }}</span>
              </div>
            </div>
            <div class="cost-item">
              <div class="cost-icon">📊</div>
              <div class="cost-details">
                <span class="cost-label">Costo por Unidad</span>
                <span class="cost-value">${{ formatCost(lote.costo_unitario_producto) }}</span>
              </div>
            </div>
            <div class="cost-item">
              <div class="cost-icon">📦</div>
              <div class="cost-details">
                <span class="cost-label">Unidades Producidas</span>
                <span class="cost-value">{{ formatQuantity(lote.produced_quantity) }}</span>
              </div>
            </div>
            <div class="cost-item">
              <div class="cost-icon">🧪</div>
              <div class="cost-details">
                <span class="cost-label">Total de Materiales</span>
                <span class="cost-value">{{ lote.total_materiales || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de materiales utilizados -->
      <div class="materials-card">
        <div class="card-header">
          <h3>Materiales Utilizados</h3>
          <button 
            class="btn-primary" 
            @click="openAddMaterialModal"
            :disabled="lote.status === 'completed'"
          >
            + Agregar Material
          </button>
        </div>

        <div class="card-body">
          <div v-if="loadingMateriales" class="loading-state">Cargando materiales...</div>
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
                <th class="text-right">Costo Unit.</th>
                <th class="text-right">Costo Total</th>
                <th>Stock Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="material in materiales" :key="material.id">
                <td>{{ material.raw_material_code }}</td>
                <td><strong>{{ material.raw_material_name }}</strong></td>
                <td class="text-right">{{ formatQuantity(material.used_quantity) }}</td>
                <td>{{ material.unit_symbol || getUnitSymbolById(material.unit) }}</td>
                <td class="text-right">${{ formatCost(material.costo_unitario) }}</td>
                <td class="text-right cost-highlight">${{ formatCost(material.costo_total) }}</td>
                <td>
                  <span :class="['badge-stock', getStockClass(material)]">
                    {{ formatQuantity(material.stock_disponible) }}
                  </span>
                </td>
                <td class="action-buttons">
                  <Tooltip text="Editar material">
                    <button 
                      class="btn-icon btn-edit" 
                      @click="openEditMaterialModal(material.id)" 
                      :disabled="lote.status === 'completed'"
                      aria-label="Editar"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                  </Tooltip>
                  <Tooltip text="Eliminar material">
                    <button 
                      class="btn-icon btn-delete" 
                      @click="deleteMaterial(material.id)"
                      :disabled="lote.status === 'completed'"
                      aria-label="Eliminar"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </Tooltip>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-row">
                <td colspan="5" class="text-right"><strong>Total:</strong></td>
                <td class="text-right"><strong>${{ formatCost(totalCostoMateriales) }}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>

          <!-- Advertencia para lotes completados -->
          <div v-if="lote.status === 'completed'" class="alert-info">
            <i class="fa-solid fa-lock"></i>
            Este lote está completado. No se pueden agregar, editar o eliminar materiales.
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
const loadingMateriales = ref(false)
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
const totalCostoMateriales = computed(() => {
  return materiales.value.reduce((sum, m) => {
    return sum + parseFloat(m.costo_total || 0)
  }, 0)
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

const getStockClass = (material) => {
  const stock = parseFloat(material.stock_disponible || 0)
  
  if (stock <= 0) return 'stock-zero'
  if (stock < 10) return 'stock-low'
  return 'stock-ok'
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

const formatQuantity = (num) => {
  if (!num) return '0.0000'
  return parseFloat(num).toFixed(4)
}

const formatCost = (num) => {
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
    loadingMateriales.value = true
    const data = await loteProduccionService.getMaterialesByLote(loteId)
    materiales.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando materiales:', err)
    showNotification('Error al cargar los materiales', 'error')
  } finally {
    loadingMateriales.value = false
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
  loadLote() // Recargar para actualizar costos
  showNotification(selectedMaterialId.value ? 'Material actualizado' : 'Material agregado', 'success')
}

const changeStatus = (newStatus) => {
  if (lote.value.status === 'completed' && newStatus !== 'completed') {
    showNotification('Un lote completado no puede cambiar a otro estado', 'error')
    return
  }

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

const completarProduccion = () => {
  if (materiales.value.length === 0) {
    showNotification('Debes agregar al menos un material antes de completar', 'error')
    return
  }

  confirmDialog.value = {
    title: 'Completar Producción',
    message: `¿Estás seguro de completar este lote? Esta acción:
    
• Descontará las materias primas del inventario
• Sumará el producto terminado al inventario
• Registrará movimientos en Kardex
• No podrá revertirse`,
    confirmText: 'Completar',
    cancelText: 'Cancelar',
    onConfirm: async () => {
      try {
        loading.value = true
        await loteProduccionService.completarProduccion(loteId)
        loadLote()
        loadMateriales()
        showNotification('Lote completado exitosamente', 'success')
      } catch (err) {
        console.error('Error completando lote:', err)
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message
        showNotification(`Error: ${errorMsg}`, 'error')
      } finally {
        loading.value = false
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
        loadLote() // Recargar para actualizar costos
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
  max-width: 1400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #E5E7EB;
}

.topbar-title {
  font-size: 24px;
  font-weight: 600;
  color: #6B7280;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-edit:hover:not(:disabled) { background: #FEF3C7; color: #92400E; }
.btn-delete:hover:not(:disabled) { background: #FEE2E2; color: #991B1B; }

.summary-row {
  background: #F9FAFB;
  font-weight: 600;
  border-top: 2px solid #E5E7EB;
}

.alert-info {
  background: #EFF6FF;
  border: 1px solid #93C5FD;
  border-radius: 6px;
  padding: 12px;
  color: #1E40AF;
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 16px;
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

.help-text {
  font-size: 12px;
  color: #6B7280;
  margin-top: 4px;
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

  .info-grid {
    grid-template-columns: 1fr;
  }

  .costs-grid {
    grid-template-columns: 1fr;
  }

  .table {
    font-size: 12px;
  }

  .table th,
  .table td {
    padding: 8px 12px;
  }
}

.topbar-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary, .btn-success {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563EB;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #E5E7EB;
  color: #374151;
}

.btn-secondary:hover {
  background: #D1D5DB;
}

.btn-success {
  background: #10B981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin: 0 auto 40px;
  width: 95%;
  max-width: 1400px;
}

.info-card,
.costs-card,
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

.info-value small {
  display: block;
  font-size: 13px;
  color: #6B7280;
  margin-top: 2px;
}

.cost-highlight {
  color: #059669;
  font-weight: 600;
}

.observaciones-section {
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
  margin-top: 20px;
}

.observaciones-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.observaciones-section p {
  color: #6B7280;
  line-height: 1.6;
}

.costs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.cost-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.cost-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.cost-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cost-label {
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

.cost-value {
  font-size: 20px;
  color: #374151;
  font-weight: 600;
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
  margin-bottom: 8px;
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

.btn-status:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
}

.btn-status.active {
  background: #3B82F6;
  border-color: #3B82F6;
  color: white;
}

.btn-status:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.text-right {
  text-align: right;
}

.badge-stock {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.stock-ok { background: #DCFCE7; color: #166534; }
.stock-low { background: #FEF3C7; color: #92400E; }
.stock-zero { background: #FEE2E2; color: #991B1B; }

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
</style>