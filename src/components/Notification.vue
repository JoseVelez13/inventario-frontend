<template>
  <transition name="fade-in-up" appear>
    <div v-if="visible" class="notification-overlay" @click="close">
      <div class="notification-card" :class="type" @click.stop>
        <!-- Ícono central grande con efecto -->
        <div class="icon-container">
          <div class="icon-glow"></div>
          <div class="icon-main">
            <svg v-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M20 6L9 17l-5-5" class="check-path"/>
            </svg>
            <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12" class="error-path"/>
            </svg>
            <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4m0 4h.01"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4m0-4h.01"/>
            </svg>
          </div>
        </div>

        <!-- Contenido -->
        <div class="content">
          <h2 class="title">{{ title }}</h2>
          <p class="message">{{ message }}</p>
        </div>

        <!-- Botón principal para cerrar -->
        <button class="action-btn" @click="close">
          Entendido
        </button>

        <!-- Barra de progreso para auto-cierre -->
        <div class="progress-bar"></div>
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
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 3000 // Auto-cerrar después de 3 segundos
  }
})

const emit = defineEmits(['close'])

const visible = ref(props.show)

watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})

const close = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.3s ease;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Card principal */
.notification-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px 40px;
  max-width: 420px;
  width: 90%;
  box-shadow: 
    0 40px 80px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
  text-align: center;
  animation: cardAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes cardAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Colores por tipo */
.notification-card.success {
  --icon-bg: linear-gradient(135deg, #10B981, #059669);
  --icon-shadow: 0 10px 40px rgba(16, 185, 129, 0.5);
}

.notification-card.error {
  --icon-bg: linear-gradient(135deg, #EF4444, #DC2626);
  --icon-shadow: 0 10px 40px rgba(239, 68, 68, 0.5);
}

.notification-card.warning {
  --icon-bg: linear-gradient(135deg, #F59E0B, #D97706);
  --icon-shadow: 0 10px 40px rgba(245, 158, 11, 0.5);
}

.notification-card.info {
  --icon-bg: linear-gradient(135deg, #3B82F6, #2563EB);
  --icon-shadow: 0 10px 40px rgba(59, 130, 246, 0.5);
}

/* Ícono central espectacular */
.icon-container {
  position: relative;
  margin: 0 auto 32px;
  width: 100px;
  height: 100px;
}

.icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: var(--icon-bg);
  border-radius: 50%;
  opacity: 0.3;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}

.icon-main {
  position: relative;
  width: 100px;
  height: 100px;
  background: var(--icon-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--icon-shadow);
  animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes iconPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.icon-main svg {
  width: 50px;
  height: 50px;
  color: white;
  stroke-width: 3;
}

.check-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: drawCheck 0.6s ease 0.5s forwards;
}

.error-path {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: drawError 0.6s ease 0.5s forwards;
}

@keyframes drawCheck {
  to { stroke-dashoffset: 0; }
}

@keyframes drawError {
  to { stroke-dashoffset: 0; }
}

/* Contenido */
.content {
  animation: contentFade 0.5s ease 0.4s both;
}

@keyframes contentFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #1F2937;
  margin: 0 0 12px;
  font-family: 'Inter', 'Roboto', sans-serif;
  letter-spacing: -0.5px;
}

.message {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
  line-height: 1.6;
}

/* Barra de progreso */
.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  background: var(--icon-bg);
  width: 100%;
  transform-origin: left;
  animation: progressShrink 3s linear;
}

@keyframes progressShrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Botón de acción */
.action-btn {
  margin-top: 24px;
  padding: 14px 40px;
  border: none;
  background: var(--icon-bg);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', 'Roboto', sans-serif;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.action-btn:active {
  transform: translateY(0);
}

/* Transiciones */
.notification-fade-enter-active {
  transition: opacity 0.3s ease;
}

.notification-fade-leave-active {
  transition: opacity 0.3s ease;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
}

.notification-fade-leave-active .notification-card {
  animation: cardZoomOut 0.4s ease;
}

@keyframes cardZoomOut {
  to {
    opacity: 0;
    transform: scale(0.8) rotate(10deg);
  }
}

/* Nueva animación fade-in-up */
.fade-in-up-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-in-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-in-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-in-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
