<template>
  <div class="filter-chip" :class="{ active: isActive }">
    <span class="chip-label">{{ label }}</span>
    <button 
      v-if="isActive && removable" 
      class="chip-remove" 
      @click="$emit('remove')"
      aria-label="Remover filtro"
    >
      <i class="fa-solid fa-times"></i>
    </button>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  removable: {
    type: Boolean,
    default: true
  }
})

defineEmits(['remove'])
</script>

<style scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.filter-chip:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.filter-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.chip-label {
  line-height: 1;
}

.chip-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.chip-remove:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.chip-remove i {
  font-size: 10px;
}
</style>
