<template>
  <button 
    class="dark-mode-toggle" 
    @click="toggle"
    :class="{ active: isDark }"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
    aria-label="Toggle dark mode"
  >
    <span class="toggle-slider">
      <transition name="icon-fade" mode="out-in">
        <span v-if="isDark" key="moon" class="icon">🌙</span>
        <span v-else key="sun" class="icon">☀️</span>
      </transition>
    </span>
  </button>
</template>

<script setup>
import { useDarkMode } from '../composables/useDarkMode'

const { isDark, toggleDarkMode } = useDarkMode()

const toggle = () => {
  toggleDarkMode()
}
</script>

<style scoped>
.dark-mode-toggle {
  position: relative;
  width: 60px;
  height: 32px;
  border-radius: 50px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  padding: 0 3px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark-mode-toggle:active {
  transform: scale(0.98);
}

/* Estado activo (modo oscuro) */
.dark-mode-toggle.active {
  background: rgba(59, 130, 246, 0.4);
  border-color: rgba(59, 130, 246, 0.5);
}

.dark-mode-toggle.active:hover {
  background: rgba(59, 130, 246, 0.5);
  border-color: rgba(59, 130, 246, 0.6);
}

/* El círculo deslizante */
.toggle-slider {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  left: 3px;
}

.toggle-slider .icon {
  line-height: 1;
  user-select: none;
}

/* Mover el círculo cuando está activo */
.dark-mode-toggle.active .toggle-slider {
  transform: translateX(28px);
}

/* Animaciones del icono */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.3s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.3);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.3);
}
</style>
