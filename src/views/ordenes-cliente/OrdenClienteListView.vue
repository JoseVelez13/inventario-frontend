<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Órdenes de Cliente
        <span class="chip" aria-live="polite" title="Total de órdenes">
          <template v-if="!loading">{{ totalOrdenes }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de órdenes">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Crear una nueva orden">
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
            placeholder="Buscar por código de orden o cliente..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando órdenes...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="allOrdenes.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay órdenes registradas</h3>
          <p>Comienza agregando tu primera orden de cliente</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th class="sortable-header" @click="toggleSort('id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th class="sortable-header" @click="toggleSort('order_code')">
                <div class="header-content">
                  <span>Código</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'order_code' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'order_code' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th class="sortable-header" @click="toggleSort('client_name')">
                <div class="header-content">
                  <span>Cliente</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'client_name' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'client_name' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th class="sortable-header" @click="toggleSort('order_date')">
                <div class="header-content">
                  <span>Fecha de Orden</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'order_date' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'order_date' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th class="sortable-header" @click="toggleSort('total_amount')">
                <div class="header-content">
                  <span>Total</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'total_amount' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'total_amount' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th class="sortable-header" @click="toggleSort('status')">
                <div class="header-content">
                  <span>Estado</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'status' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'status' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="orden in paginatedData" :key="orden.id" class="animate-fade-in">
              <td>{{ orden.id }}</td>
              <td><strong>{{ orden.order_code }}</strong></td>
              <td>{{ orden.client_name || '-' }}</td>
              <td>{{ formatDate(orden.order_date) }}</td>
              <td class="amount">${{ formatAmount(orden.total_amount) }}</td>
              <td>
                <span :class="['badge', `status-${orden.status}`]">
                  {{ getStatusLabel(orden.status) }}
                </span>
              </td>
              <td class="action-buttons">
                <Tooltip text="Editar orden">
                  <button class="btn-icon btn-edit" @click="editOrden(orden)">
                    ✏️
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar orden">
                  <button class="btn-icon btn-delete" @click="deleteOrden(orden)">
                    🗑️
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="allOrdenes.length > 0" class="pagination-container">
          <div class="pagination-info">
            <span>Mostrando {{ startItem }}-{{ endItem }} de {{ totalFiltered }} órdenes</span>
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

    <!-- Modal de Crear/Editar Orden -->
    <OrdenClienteFormModal
      :show="showOrdenModal"
      :edit-id="formEditId"
      @close="onModalClose"
      @saved="onModalSaved"
    />

    <!-- Notificación -->
    <Notification
      :show="notification.show"
      :type="notification.type"
      :title="notification.title"
      :message="notification.message"
      @close="notification.show = false"
    />
  </div>
</template>

<script>
import HeaderGlobal from '../../components/HeaderGlobal.vue'
import Breadcrumbs from '../../components/Breadcrumbs.vue'
import Tooltip from '../../components/Tooltip.vue'
import Notification from '../../components/Notification.vue'
import OrdenClienteFormModal from '../../components/ordenes-cliente/OrdenClienteFormModal.vue'
import '../../assets/styles/Clientes.css'
import * as ordenClienteService from '../../services/ordenClienteService'

export default {
  name: 'OrdenClienteListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, Notification, OrdenClienteFormModal },
  data() {
    return {
      search: '',
      allOrdenes: [],
      loading: false,
      error: '',
      sortField: null,
      sortOrder: 'asc',
      currentPage: 1,
      pageSize: 10,
      totalOrdenes: 0,
      notification: { show: false, message: '', title: '', type: 'success' },
      showOrdenModal: false,
      formEditId: null
    }
  },
  created() { this.fetchOrdenes() },
  computed: {
    filtered() {
      if (!this.search) return this.allOrdenes
      const term = this.search.toLowerCase()
      return this.allOrdenes.filter(o => (o.order_code && o.order_code.toLowerCase().includes(term)) || (o.client_name && o.client_name.toLowerCase().includes(term)))
    },
    sortedAndFiltered() {
      const data = [...this.filtered]
      if (!this.sortField) return data
      return data.sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]
        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''
        if (this.sortField === 'id' || this.sortField === 'total_amount') {
          aVal = Number(aVal) || 0
          bVal = Number(bVal) || 0
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }
        if (this.sortField === 'order_date') {
          aVal = new Date(aVal).getTime() || 0
          bVal = new Date(bVal).getTime() || 0
          return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
        }
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        return this.sortOrder === 'asc' ? aStr.localeCompare(bStr, 'es', { numeric: true }) : bStr.localeCompare(aStr, 'es', { numeric: true })
      })
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sortedAndFiltered.slice(start, end)
    },
    totalFiltered() { return this.filtered.length },
    totalPages() { return Math.ceil(this.totalFiltered / this.pageSize) },
    startItem() { return this.totalFiltered === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1 },
    endItem() { return Math.min(this.currentPage * this.pageSize, this.totalFiltered) }
  },
  methods: {
    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
    },
    async fetchOrdenes() {
      this.loading = true
      this.error = ''
      try {
        let allData = []
        let page = 1
        let hasMore = true
        while (hasMore) {
          const response = await ordenClienteService.getOrdenesCliente({ page, page_size: 100 })
          if (response.results) {
            allData = allData.concat(response.results)
            this.totalOrdenes = response.count || 0
            hasMore = !!response.next
            page++
          } else {
            allData = Array.isArray(response) ? response : []
            this.totalOrdenes = allData.length
            hasMore = false
          }
        }
        this.allOrdenes = allData
        this.currentPage = 1
      } catch (e) {
        console.error('Error al listar órdenes', e)
        this.error = 'No se pudo cargar la lista de órdenes.'
      } finally {
        this.loading = false
      }
    },
    onSearch() { this.currentPage = 1 },
    clearSearch() {
      this.search = ''
      this.$nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) searchInput.focus()
      })
    },
    reload() {
      this.currentPage = 1
      this.fetchOrdenes()
    },
    previousPage() { if (this.currentPage > 1) this.currentPage-- },
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++ },
    goToPage() {
      if (this.currentPage < 1) this.currentPage = 1
      else if (this.currentPage > this.totalPages) this.currentPage = this.totalPages
    },
    changePageSize() { this.currentPage = 1 },
    openCreateModal() { this.formEditId = null; this.showOrdenModal = true },
    editOrden(orden) { this.formEditId = orden.id; this.showOrdenModal = true },
    async deleteOrden(orden) {
      if (!confirm(`¿Eliminar la orden ${orden.order_code}? Esta acción no se puede deshacer.`)) return
      try {
        await ordenClienteService.deleteOrdenCliente(orden.id)
        await this.fetchOrdenes()
        this.showNotification('Orden eliminada exitosamente', 'success')
      } catch (err) {
        console.error('Error eliminando orden:', err)
        this.showNotification('Error al eliminar la orden', 'error')
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('es-CO')
    },
    formatAmount(amount) {
      return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)
    },
    getStatusLabel(status) {
      const labels = { 'pending': 'Pendiente', 'confirmed': 'Confirmada', 'in_progress': 'En Progreso', 'completed': 'Completada', 'cancelled': 'Cancelada' }
      return labels[status] || status
    },
    showNotification(message, type = 'success') {
      this.notification = { show: true, message, type, title: '' }
      setTimeout(() => { this.notification.show = false }, 3000)
    },
    onModalClose() { this.showOrdenModal = false; this.formEditId = null },
    onModalSaved() { this.showOrdenModal = false; this.formEditId = null; this.fetchOrdenes(); this.showNotification('Orden guardada exitosamente', 'success') }
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.sortable-header {
  cursor: pointer;
  user-select: none;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sort-indicator {
  display: flex;
  align-items: center;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.sortable-header:hover .sort-indicator {
  opacity: 0.7;
}

.sort-indicator .active {
  opacity: 1;
  color: #3B82F6;
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

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-icon {
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.btn-icon:hover {
  transform: scale(1.1);
}

.btn-edit:hover {
  color: #3B82F6;
}

.btn-delete:hover {
  color: #EF4444;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #6B7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.page-input {
  width: 50px;
  padding: 6px 8px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
}

.page-size-select {
  padding: 6px 8px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 14px;
}
</style>
