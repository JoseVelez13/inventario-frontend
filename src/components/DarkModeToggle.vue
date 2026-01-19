<template>
  <button 
    class="dark-mode-toggle" 
    @click="toggle"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
    aria-label="Toggle dark mode"
  >
    <transition name="icon-fade" mode="out-in">
      <i v-if="isDark" key="sun" class="fa-solid fa-sun"></i>
      <i v-else key="moon" class="fa-solid fa-moon"></i>
    </transition>
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
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.dark-mode-toggle:active {
  transform: scale(0.95);
}

.dark-mode-toggle i {
  transition: all 0.3s;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

/* Para modo oscuro activo */
:global(.dark-mode) .dark-mode-toggle {
  background: rgba(255, 255, 255, 0.15);
}

:global(.dark-mode) .dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
}
</style>
