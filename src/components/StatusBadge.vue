<template>
  <span 
    class="status-badge" 
    :class="[variant, { 'with-pulse': pulse }]"
    :title="title"
  >
    <span v-if="icon" class="badge-icon">{{ icon }}</span>
    <span class="badge-text">{{ text }}</span>
    <span v-if="pulse" class="pulse-dot"></span>
  </span>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'success', 'warning', 'danger', 'info', 
      'primary', 'secondary', 'default'
    ].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  pulse: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
}

.badge-icon {
  font-size: 0.875rem;
  line-height: 1;
}

.badge-text {
  line-height: 1;
}

/* Variantes de color */
.status-badge.success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-badge.warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
  border: 1px solid #ffeaa7;
}

.status-badge.danger {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-badge.info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status-badge.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: 1px solid #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.status-badge.secondary {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #374151;
  border: 1px solid #d1d5db;
}

.status-badge.default {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* Efecto hover */
.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Pulse effect */
.status-badge.with-pulse .pulse-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.status-badge.danger .pulse-dot {
  background: #dc3545;
}

.status-badge.warning .pulse-dot {
  background: #ffc107;
}

.status-badge.success .pulse-dot {
  background: #28a745;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.5);
  }
}

/* Tamaños alternativos */
.status-badge.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.625rem;
}

.status-badge.large {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
