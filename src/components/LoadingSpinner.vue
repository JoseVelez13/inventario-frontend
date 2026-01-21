<template>
  <div class="loading-spinner" v-if="visible">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="message" class="spinner-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
}

.spinner-container {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner-message {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}
</style>
