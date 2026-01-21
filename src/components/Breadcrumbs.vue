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
  }

  // Materias Primas
  if (path.includes('/materias-primas')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Materias Primas', path: '/materias-primas' })
    
    if (path.includes('/nuevo')) {
      breadcrumbs.push({ label: 'Nueva Materia Prima', path: '/materias-primas/nuevo' })
    }
  }

  // Proveedores
  if (path.includes('/proveedores')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Proveedores', path: '/proveedores' })
  }

  // Almacenes
  if (path.includes('/almacenes')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Almacenes', path: '/almacenes' })
  }

  // Unidades
  if (path.includes('/unidades')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Unidades de Medida', path: '/unidades' })
  }

  // Kardex
  if (path.includes('/kardex')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Kardex', path: '/kardex' })
  }

  // Lotes de Producción
  if (path.includes('/lotes-produccion')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Lotes de Producción', path: '/lotes-produccion' })
    
    if (path.match(/\/lotes-produccion\/[^/]+$/)) {
      breadcrumbs.push({ label: 'Detalle del Lote', path: path })
    }
  }

  // Recepciones de Material
  if (path.includes('/recepciones')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Recepciones de Material', path: '/recepciones' })
  }

  // Recepciones de Productos
  if (path.includes('/recepciones-productos')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Recepciones de Productos', path: '/recepciones-productos' })
  }

  // Órdenes de Cliente
  if (path.includes('/ordenes-cliente')) {
    breadcrumbs.push({ label: 'Aplicaciones', path: '/dashboard' })
    breadcrumbs.push({ label: 'Órdenes de Cliente', path: '/ordenes-cliente' })
    
    if (path.match(/\/ordenes-cliente\/[^/]+$/)) {
      breadcrumbs.push({ label: 'Detalle de Orden', path: path })
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
