<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="cancel">
      <div class="dialog-card" @click.stop>
        <!-- Ícono de advertencia -->
        <div class="icon-container warning">
          <div class="icon-glow"></div>
          <div class="icon-main">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>

        <!-- Contenido -->
        <div class="content">
          <h2 class="title">{{ title }}</h2>
          <p class="message">{{ message }}</p>
        </div>

        <!-- Botones de acción -->
        <div class="actions">
          <button class="btn-cancel" @click="cancel">{{ cancelText }}</button>
          <button class="btn-confirm" @click="confirm">{{ confirmText }}</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '¿Estás seguro?'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Eliminar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const visible = ref(props.show)

watch(() => props.show, (newVal) => {
  visible.value = newVal
})

const confirm = () => {
  visible.value = false
  emit('confirm')
}

const cancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 36px 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 
    0 40px 80px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
  text-align: center;
  animation: cardAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Contenedor del ícono */
.icon-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  position: relative;
}

.icon-container.warning {
  --icon-bg: linear-gradient(135deg, #F59E0B, #D97706);
  --icon-shadow: 0 10px 40px rgba(245, 158, 11, 0.5);
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: var(--icon-bg);
  border-radius: 50%;
  opacity: 0.2;
  filter: blur(20px);
}

.icon-main {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--icon-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--icon-shadow);
  animation: iconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.icon-main svg {
  width: 42px;
  height: 42px;
  color: #ffffff;
}

/* Contenido */
.content {
  margin-bottom: 32px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 12px;
  font-family: 'Inter', 'Roboto', sans-serif;
  letter-spacing: -0.3px;
}

.message {
  font-size: 15px;
  color: #6B7280;
  margin: 0;
  line-height: 1.6;
  font-family: 'Inter', 'Roboto', sans-serif;
}

/* Botones de acción */
.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.btn-cancel {
  background: #F3F4F6;
  color: #4B5563;
}

.btn-cancel:hover {
  background: #E5E7EB;
  transform: translateY(-1px);
}

.btn-confirm {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}

.btn-cancel:active,
.btn-confirm:active {
  transform: translateY(0);
}

/* Transiciones */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active .dialog-card {
  animation: cardAppear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-fade-leave-active .dialog-card {
  animation: cardDisappear 0.3s ease;
}

@keyframes cardDisappear {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
}
</style>
