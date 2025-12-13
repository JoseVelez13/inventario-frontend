<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(crumb, index) in crumbs" :key="index" class="breadcrumb-item">
        <router-link 
          v-if="index < crumbs.length - 1" 
          :to="crumb.path"
          class="breadcrumb-link"
        >
          {{ crumb.label }}
        </router-link>
        <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
        <span v-if="index < crumbs.length - 1" class="breadcrumb-separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const crumbs = computed(() => {
  const path = route.path
  const breadcrumbs = []

  // Dashboard
  if (path.includes('/dashboard')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
  }

  // Clientes
  if (path.includes('/clientes')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Clientes', path: '/clientes' })
  }

  // Productos
  if (path.includes('/productos')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Productos', path: '/productos' })
    
    if (path.includes('/nuevo')) {
      breadcrumbs.push({ label: 'Nuevo Producto', path: '/productos/nuevo' })
    }
  }

  // Materia Prima
  if (path.includes('/materia-prima')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Materia Prima', path: '/materia-prima' })
    
    if (path.includes('/nuevo')) {
      breadcrumbs.push({ label: 'Nueva Materia Prima', path: '/materia-prima/nuevo' })
    }
  }

  return breadcrumbs
})
</script>

<style scoped>
.breadcrumbs {
  margin: 16px auto 0;
  width: 95%;
  max-width: 1200px;
  padding: 0 8px;
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  color: var(--color-text-secondary, #6B7280);
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 400;
}

.breadcrumb-link:hover {
  color: var(--color-primary, #4F6F8F);
}

.breadcrumb-current {
  color: var(--color-text, #374151);
  font-weight: 500;
}

.breadcrumb-separator {
  color: var(--color-border, #E5E7EB);
  user-select: none;
}
</style>
