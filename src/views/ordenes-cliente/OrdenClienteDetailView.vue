<template>
  <div class="page-container">
    <HeaderGlobal />
    
    <div class="page-content">
      <Breadcrumbs 
        :items="[
          { label: 'Inicio', path: '/' },
          { label: 'Órdenes de Cliente', path: '/ordenes-cliente' },
          { label: orden?.order_code || 'Cargando...', path: '' }
        ]" 
      />

      <div v-if="loading" class="loading-container">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Cargando orden...</p>
      </div>

      <div v-else-if="orden" class="detail-container">
        <!-- Encabezado con acciones -->
        <div class="detail-header">
          <div class="header-info">
            <button class="btn-back" @click="$router.back()">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h1>{{ orden.order_code }}</h1>
              <p class="order-meta">Cliente: <strong>{{ orden.client_name }}</strong></p>
            </div>
          </div>
          <div class="header-actions">
            <button class="btn-secondary" @click="editOrden" title="Editar orden">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button class="btn-secondary btn-danger-light" @click="deleteOrden" title="Eliminar orden">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Info General -->
        <div class="info-grid">
          <div class="info-card">
            <div class="info-label">Estado</div>
            <div class="info-value">
              <span :class="['badge', `status-${orden.status}`]">
                {{ getStatusLabel(orden.status) }}
              </span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">Fecha de Orden</div>
            <div class="info-value">{{ formatDate(orden.order_date) }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Total</div>
            <div class="info-value total">${{ formatAmount(orden.total_amount) }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">Impuestos</div>
            <div class="info-value">${{ formatAmount(orden.tax_amount) }}</div>
          </div>
        </div>

        <!-- Items de la Orden -->
        <div class="section">
          <div class="section-header">
            <h2>Items de la Orden</h2>
            <button class="btn-primary" @click="openItemModal">
              <i class="fa-solid fa-plus"></i> Agregar Item
            </button>
          </div>

          <div v-if="!orden.items || orden.items.length === 0" class="no-items">
            <i class="fa-solid fa-inbox"></i>
            <p>No hay items en esta orden</p>
            <button class="btn-primary" @click="openItemModal">
              Agregar primer item
            </button>
          </div>

          <div v-else class="items-table">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="text-right">Cantidad</th>
                  <th class="text-right">Precio Unitario</th>
                  <th class="text-right">Subtotal</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orden.items" :key="item.id" class="item-row">
                  <td>{{ item.product_name || item.producto_nombre }}</td>
                  <td class="text-right">{{ item.quantity }}</td>
                  <td class="text-right">${{ formatAmount(item.unit_price) }}</td>
                  <td class="text-right subtotal">${{ formatAmount(item.quantity * item.unit_price) }}</td>
                  <td class="actions">
                    <Tooltip text="Editar">
                      <button 
                        class="btn-icon"
                        @click="editItem(item)"
                      >
                        <i class="fa-solid fa-edit"></i>
                      </button>
                    </Tooltip>
                    <Tooltip text="Eliminar">
                      <button 
                        class="btn-icon btn-danger"
                        @click="deleteItem(item)"
                      >
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="3" class="total-label">TOTAL</td>
                  <td class="total-amount text-right">${{ formatAmount(orden.total_amount) }}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Notas -->
        <div v-if="orden.notes" class="section">
          <h2>Notas</h2>
          <div class="notes-box">
            {{ orden.notes }}
          </div>
        </div>
      </div>

      <div v-else class="error-container">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>No se pudo cargar la orden</p>
      </div>
    </div>

    <!-- Modal para agregar/editar items -->
    <OrdenItemFormModal
      :show="showItemModal"
      :orden-id="ordenId"
      :item-id="selectedItemId"
      @close="showItemModal = false"
      @saved="loadOrden"
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderGlobal from '../../components/HeaderGlobal.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Tooltip from '../../components/Tooltip.vue'
import Notification from '../../components/Notification.vue'
import OrdenItemFormModal from '../../components/ordenes-cliente/OrdenItemFormModal.vue'
import * as ordenClienteService from '../../services/ordenClienteService'

const route = useRoute()
const router = useRouter()

const ordenId = route.params.id
const orden = ref(null)
const loading = ref(false)

const showItemModal = ref(false)
const selectedItemId = ref(null)

const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

async function loadOrden() {
  try {
    loading.value = true
    const data = await ordenClienteService.getOrdenCliente(ordenId)
    orden.value = data
  } catch (err) {
    console.error('Error cargando orden:', err)
    showNotification('Error al cargar la orden', 'error')
  } finally {
    loading.value = false
  }
}

function openItemModal() {
  selectedItemId.value = null
  showItemModal.value = true
}

function editItem(item) {
  selectedItemId.value = item.id
  showItemModal.value = true
}

async function deleteItem(item) {
  if (!confirm(`¿Estás seguro de que quieres eliminar este item?`)) {
    return
  }

  try {
    await ordenClienteService.deleteItemFromOrden(ordenId, item.id)
    await loadOrden()
    showNotification('Item eliminado exitosamente', 'success')
  } catch (err) {
    console.error('Error eliminando item:', err)
    showNotification('Error al eliminar el item', 'error')
  }
}

function editOrden() {
  router.push(`/ordenes-cliente/${ordenId}/editar`)
}

async function deleteOrden() {
  if (!confirm(`¿Estás seguro de que quieres eliminar esta orden?`)) {
    return
  }

  try {
    await ordenClienteService.deleteOrdenCliente(ordenId)
    showNotification('Orden eliminada exitosamente', 'success')
    setTimeout(() => {
      router.push('/ordenes-cliente')
    }, 1500)
  } catch (err) {
    console.error('Error eliminando orden:', err)
    showNotification('Error al eliminar la orden', 'error')
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-CO')
}

function formatAmount(amount) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmada',
    'in_progress': 'En Proceso',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  }
  return labels[status] || status
}

function showNotification(message, type = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

onMounted(() => {
  loadOrden()
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #F3F4F6;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #6B7280;
}

.loading-container i,
.error-container i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #D1D5DB;
}

.detail-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.header-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.btn-back {
  width: 40px;
  height: 40px;
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.2s;
  font-size: 16px;
  flex-shrink: 0;
}

.btn-back:hover {
  background: #F3F4F6;
  border-color: #9CA3AF;
}

.detail-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.order-meta {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary {
  width: 40px;
  height: 40px;
  padding: 0;
  background: #E5E7EB;
  color: #374151;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  transition: background 0.2s;
  font-size: 16px;
}

.btn-secondary:hover {
  background: #D1D5DB;
}

.btn-secondary.btn-danger-light:hover {
  background: #FEE2E2;
  color: #DC2626;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.info-card {
  padding: 16px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
}

.info-label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.info-value.total {
  color: #059669;
  font-size: 20px;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #FEF3C7;
  color: #92400E;
}

.status-confirmed {
  background: #DBEAFE;
  color: #0C4A6E;
}

.status-in_progress {
  background: #F3E8FF;
  color: #5B21B6;
}

.status-completed {
  background: #DCFCE7;
  color: #166534;
}

.status-cancelled {
  background: #FEE2E2;
  color: #991B1B;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #E5E7EB;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.btn-primary {
  padding: 10px 16px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: background 0.2s;
  font-size: 14px;
}

.btn-primary:hover:not(:disabled) {
  background: #2563EB;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.no-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6B7280;
  background: #F9FAFB;
  border: 2px dashed #D1D5DB;
  border-radius: 6px;
}

.no-items i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #D1D5DB;
}

.no-items p {
  margin: 0 0 16px 0;
}

.items-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
}

thead {
  background: #F9FAFB;
  border-bottom: 2px solid #E5E7EB;
}

th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

th.text-right {
  text-align: right;
}

th.text-center {
  text-align: center;
}

tbody tr {
  border-bottom: 1px solid #E5E7EB;
  transition: background 0.15s;
}

tbody tr:hover {
  background: #F9FAFB;
}

td {
  padding: 16px;
  font-size: 14px;
  color: #1F2937;
}

td.text-right {
  text-align: right;
}

td.text-center {
  text-align: center;
}

.item-row:last-child {
  border-bottom: none;
}

.subtotal {
  font-weight: 600;
  color: #059669;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #374151;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #F3F4F6;
  border-color: #9CA3AF;
}

.btn-icon.btn-danger:hover {
  background: #FEE2E2;
  border-color: #EF4444;
  color: #EF4444;
}

tfoot {
  background: #F3F4F6;
  border-top: 2px solid #D1D5DB;
  font-weight: 600;
}

.total-row {
  display: table-row;
}

.total-label {
  text-align: right;
  padding: 16px 16px;
  font-weight: 700;
}

.total-amount {
  font-size: 16px;
  color: #059669;
}

.notes-box {
  padding: 16px;
  background: #F9FAFB;
  border-left: 4px solid #3B82F6;
  border-radius: 4px;
  line-height: 1.6;
  color: #374151;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info {
    width: 100%;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .section-header h2 {
    margin-bottom: 8px;
  }

  table {
    font-size: 12px;
  }

  td, th {
    padding: 8px 12px;
  }
}
</style>
