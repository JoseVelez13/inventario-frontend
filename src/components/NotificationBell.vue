<template>
  <div class="notification-bell-container" ref="container">
    <!-- Icono campana con badge -->
    <button 
      ref="bellButton"
      class="notification-bell" 
      @click="togglePanel"
      :class="{ 'has-notifications': notifications.length > 0 }"
      aria-label="Notificaciones"
    >
      <i class="fa-solid fa-bell"></i>
      <span v-if="notifications.length > 0" class="badge">{{ notifications.length }}</span>
    </button>

    <!-- Panel desplegable de notificaciones -->
    <transition name="dropdown-fade">
      <div 
        v-if="panelOpen" 
        class="notification-panel" 
        :style="panelStyle"
        @click.stop
      >
        <div class="panel-header">
          <h3>Notificaciones</h3>
          <button 
            class="close-btn" 
            @click="panelOpen = false"
            aria-label="Cerrar notificaciones"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="panel-content">
          <div v-if="loading" class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Cargando...
          </div>
          
          <div v-else-if="notifications.length === 0" class="empty-state">
            <i class="fa-solid fa-check-circle"></i>
            <p>Sin notificaciones</p>
          </div>

          <div v-else class="notifications-list">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              :class="['notification-item', notification.type]"
            >
              <div class="notification-icon">
                <i :class="getIconClass(notification.type)"></i>
              </div>
              <div class="notification-content">
                <h4>{{ notification.title }}</h4>
                <p>{{ notification.message }}</p>
                <small class="notification-time">{{ formatTime(notification.timestamp) }}</small>
              </div>
              <button 
                class="dismiss-btn"
                @click="dismissNotification(notification.id)"
                aria-label="Descartar"
              >
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="notifications.length > 0" class="panel-footer">
          <button class="btn-clear-all" @click="clearAllNotifications">
            Limpiar todo
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay para cerrar panel -->
    <transition name="fade">
      <div 
        v-if="panelOpen" 
        class="notification-overlay" 
        @click="panelOpen = false"
      ></div>
    </transition>
  </div>
</template>

<script>
import productosService from '../services/productosService'

export default {
  name: 'NotificationBell',
  data() {
    return {
      panelOpen: false,
      notifications: [],
      loading: false,
      refreshInterval: null,
      lowStockThreshold: 10,  // Ajusta según tu necesidad
      panelPosition: { top: 0, right: 0 }
    }
  },

  computed: {
    panelStyle() {
      return {
        position: 'fixed',
        top: this.panelPosition.top + 'px',
        right: this.panelPosition.right + 'px',
        zIndex: 9999
      }
    }
  },

  mounted() {
    this.checkNotifications()
    // Refresh cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.checkNotifications()
    }, 30000)
  },

  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },

  methods: {
    togglePanel() {
      this.panelOpen = !this.panelOpen
      if (this.panelOpen) {
        this.checkNotifications()
        this.$nextTick(() => {
          this.calculatePanelPosition()
        })
      }
    },

    calculatePanelPosition() {
      if (this.$refs.bellButton) {
        const rect = this.$refs.bellButton.getBoundingClientRect()
        this.panelPosition = {
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right
        }
      }
    },

    async checkNotifications() {
      this.loading = true
      try {
        const response = await productosService.getProductos({ page_size: 100 })
        const productos = response.results || response

        // Procesar productos con bajo stock
        const lowStockProducts = Array.isArray(productos)
          ? productos.filter(p => this.isLowStock(p))
          : []

        // Generar notificaciones
        this.generateNotifications(lowStockProducts)
      } catch (e) {
        console.error('Error al verificar notificaciones:', e)
      } finally {
        this.loading = false
      }
    },

    isLowStock(product) {
      // Verificar si el producto tiene stock bajo
      // Ajusta según el nombre del campo en tu backend
      const stock = product.stock || product.cantidad_disponible || 0
      const minStock = product.stock_minimo || this.lowStockThreshold
      return stock <= minStock
    },

    generateNotifications(lowStockProducts) {
      // Limpiar notificaciones anteriores del mismo tipo
      this.notifications = this.notifications.filter(
        n => n.type !== 'low-stock'
      )

      // Agregar nuevas notificaciones de bajo stock
      lowStockProducts.forEach(product => {
        const stock = product.stock || product.cantidad_disponible || 0
        
        this.notifications.push({
          id: `low-stock-${product.id || product.product_id}`,
          type: 'low-stock',
          icon: 'fa-solid fa-exclamation-triangle',
          title: 'Bajo Stock',
          message: `${product.name || product.nombre} tiene solo ${stock} unidades disponibles`,
          timestamp: new Date(),
          product: product
        })
      })
    },

    dismissNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    },

    clearAllNotifications() {
      this.notifications = []
      this.panelOpen = false
    },

    getIconClass(type) {
      const icons = {
        'low-stock': 'fa-solid fa-exclamation-triangle',
        'restock': 'fa-solid fa-box-open',
        'warning': 'fa-solid fa-exclamation-circle',
        'info': 'fa-solid fa-info-circle'
      }
      return icons[type] || icons.info
    },

    formatTime(date) {
      if (!date) return 'Hace poco'
      const now = new Date()
      const diff = Math.floor((now - date) / 1000) // segundos

      if (diff < 60) return 'Hace unos segundos'
      if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
      if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.notification-bell-container {
  position: relative;
  display: flex;
  align-items: center;
  z-index: 100;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  font-size: 20px;
  color: var(--color-text, #374151);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  z-index: 101;
}

.notification-bell:hover {
  background: var(--color-bg, #F9FAFB);
  color: var(--color-primary, #4F6F8F);
}

.notification-bell.has-notifications {
  color: #dc2626;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc2626;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 102;
}

/* Panel desplegable */
.notification-panel {
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7c93;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #374151;
}

.panel-content {
  overflow-y: auto;
  flex: 1;
  min-height: 100px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #6b7c93;
  text-align: center;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 8px;
}

.empty-state i {
  font-size: 32px;
  margin-bottom: 8px;
  color: #d1d5db;
}

.notifications-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.low-stock {
  border-left: 4px solid #dc2626;
}

.notification-item.restock {
  border-left: 4px solid #059669;
}

.notification-item.warning {
  border-left: 4px solid #f59e0b;
}

.notification-item.info {
  border-left: 4px solid #0066cc;
}

.notification-icon {
  flex-shrink: 0;
  font-size: 18px;
}

.notification-item.low-stock .notification-icon {
  color: #dc2626;
}

.notification-item.restock .notification-icon {
  color: #059669;
}

.notification-item.warning .notification-icon {
  color: #f59e0b;
}

.notification-item.info .notification-icon {
  color: #0066cc;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.notification-content p {
  margin: 0;
  font-size: 13px;
  color: #6b7c93;
}

.notification-time {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.dismiss-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #d1d5db;
  font-size: 14px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.dismiss-btn:hover {
  color: #6b7c93;
}

.panel-footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

.btn-clear-all {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: #6b7c93;
  transition: all 0.2s ease;
}

.btn-clear-all:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

/* Overlay */
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
}

/* Transiciones */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-panel {
    width: calc(100vw - 32px);
    max-width: 380px;
    right: auto;
    left: 16px;
    margin-top: 12px;
  }
}
</style>
