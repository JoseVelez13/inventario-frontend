<template>
  <div class="skeleton-loader" :class="{ 'card': type === 'card' }">
    <template v-if="type === 'card'">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>
    </template>
    <template v-else-if="type === 'table'">
      <div class="skeleton-table-header"></div>
      <div v-for="i in rows" :key="i" class="skeleton-table-row"></div>
    </template>
    <template v-else>
      <div class="skeleton-line"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'line', // 'line', 'card', 'table'
    validator: (value) => ['line', 'card', 'table'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  }
})
</script>

<style scoped>
.skeleton-loader {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-loader.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
  margin-bottom: 12px;
}

.skeleton-title {
  height: 24px;
  width: 60%;
  margin-bottom: 16px;
}

.skeleton-text {
  height: 14px;
  width: 100%;
}

.skeleton-text.short {
  width: 70%;
}

.skeleton-table-header {
  height: 48px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: shimmer 1.5s infinite;
  margin-bottom: 8px;
}

.skeleton-table-row {
  height: 56px;
  background: linear-gradient(90deg, #f9fafb 25%, #f3f4f6 50%, #f9fafb 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
  margin-bottom: 8px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
