<template>
  <div class="product-card">
    <div class="product-header">
      <span class="product-code">{{ producto.codigo }}</span>
      <span 
        class="product-status" 
        :class="`status-${producto.estado || 'activo'}`"
      >
        {{ getEstadoLabel(producto.estado) }}
      </span>
    </div>

    <div class="product-body">
      <h3 class="product-name">{{ producto.nombre }}</h3>
      <p class="product-description">{{ producto.descripcion || 'Sin descripción' }}</p>

      <div class="product-details">
        <div class="detail-item">
          <span class="detail-label">Stock:</span>
          <span 
            class="detail-value" 
            :class="{ 'stock-low': isStockBajo }"
          >
            {{ producto.stock_actual || 0 }}
            <span v-if="producto.unidad">{{ producto.unidad.simbolo }}</span>
          </span>
        </div>

        <div class="detail-item" v-if="producto.stock_minimo">
          <span class="detail-label">Stock mínimo:</span>
          <span class="detail-value">{{ producto.stock_minimo }}</span>
        </div>

        <div class="detail-item" v-if="producto.precio_unitario">
          <span class="detail-label">Precio:</span>
          <span class="detail-value price">
            S/ {{ formatPrice(producto.precio_unitario) }}
          </span>
        </div>

        <div class="detail-item" v-if="producto.categoria">
          <span class="detail-label">Categoría:</span>
          <span class="detail-value">{{ producto.categoria }}</span>
        </div>
      </div>

      <div v-if="isStockBajo" class="stock-warning">
        ⚠️ Stock por debajo del mínimo
      </div>
    </div>

    <div class="product-footer">
      <button @click="$emit('view', producto)" class="btn btn-view">
        Ver detalles
      </button>
      <button 
        v-if="showEdit" 
        @click="$emit('edit', producto)" 
        class="btn btn-edit"
      >
        Editar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  producto: {
    type: Object,
    required: true,
  },
  showEdit: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['view', 'edit'])

// Verificar si el stock está bajo
const isStockBajo = computed(() => {
  const stock = props.producto.stock_actual || 0
  const minimo = props.producto.stock_minimo || 0
  return stock < minimo
})

// Formatear precio
function formatPrice(price) {
  if (!price) return '0.00'
  return parseFloat(price).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Obtener etiqueta del estado
function getEstadoLabel(estado) {
  const estados = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    descontinuado: 'Descontinuado',
  }
  return estados[estado] || 'Activo'
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.product-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-code {
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.product-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-activo {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-inactivo {
  background-color: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.status-descontinuado {
  background-color: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.product-body {
  padding: 20px;
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.product-description {
  margin: 0 0 16px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  min-height: 42px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  color: #666;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-weight: 600;
  font-size: 14px;
}

.detail-value.price {
  color: #4caf50;
  font-size: 16px;
}

.detail-value.stock-low {
  color: #ff5722;
}

.stock-warning {
  background-color: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 6px;
  padding: 8px 12px;
  color: #e65100;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.product-footer {
  padding: 16px;
  background-color: #f9f9f9;
  display: flex;
  gap: 8px;
  border-top: 1px solid #eee;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view {
  background-color: #667eea;
  color: white;
}

.btn-view:hover {
  background-color: #5568d3;
}

.btn-edit {
  background-color: white;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-edit:hover {
  background-color: #667eea;
  color: white;
}
</style>
