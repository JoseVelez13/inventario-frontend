<template>
  <div v-if="error" class="form-error-message">
    <span class="error-icon">⚠</span>
    <span class="error-text">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.form-error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
  font-size: 13px;
  animation: slideIn 0.2s ease-out;
}

.error-icon {
  flex-shrink: 0;
  font-weight: bold;
}

.error-text {
  flex: 1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
