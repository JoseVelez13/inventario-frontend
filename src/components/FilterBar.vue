<template>
  <div class="filter-bar">
    <div class="filter-header">
      <h3 class="filter-title">
        <i class="fa-solid fa-filter"></i>
        Filtros
      </h3>
      <button 
        v-if="hasActiveFilters" 
        class="btn-clear-filters" 
        @click="clearAllFilters"
      >
        <i class="fa-solid fa-times-circle"></i>
        Limpiar todo
      </button>
    </div>

    <div class="filter-chips">
      <FilterChip 
        v-for="filter in availableFilters" 
        :key="filter.id"
        :label="filter.label"
        :isActive="isFilterActive(filter.id)"
        @click="toggleFilter(filter.id)"
        @remove="removeFilter(filter.id)"
      />
    </div>

    <div v-if="activeFilters.length > 0" class="active-filters-summary">
      <span class="summary-text">
        <i class="fa-solid fa-check-circle"></i>
        {{ activeFilters.length }} filtro(s) activo(s)
      </span>
      <button 
        v-if="canSaveFavorite" 
        class="btn-save-filter" 
        @click="saveFavoriteFilter"
        title="Guardar como filtro favorito"
      >
        <i class="fa-solid fa-star"></i>
        Guardar filtros
      </button>
    </div>

    <div v-if="savedFilters.length > 0" class="saved-filters">
      <h4 class="saved-filters-title">Filtros guardados:</h4>
      <div class="saved-filter-list">
        <div 
          v-for="saved in savedFilters" 
          :key="saved.id"
          class="saved-filter-item"
        >
          <button 
            class="btn-load-filter" 
            @click="loadSavedFilter(saved)"
            :title="`Aplicar: ${saved.name}`"
          >
            <i class="fa-solid fa-star"></i>
            {{ saved.name }}
          </button>
          <button 
            class="btn-delete-saved" 
            @click="deleteSavedFilter(saved.id)"
            title="Eliminar filtro guardado"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FilterChip from './FilterChip.vue'

const props = defineProps({
  availableFilters: {
    type: Array,
    required: true,
    // Formato: [{ id: 'stock-bajo', label: 'Stock Bajo', value: 'low' }]
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  canSaveFavorite: {
    type: Boolean,
    default: true
  },
  storageKey: {
    type: String,
    default: 'saved-filters'
  }
})

const emit = defineEmits(['update:modelValue', 'filter-change'])

const activeFilters = ref(props.modelValue || [])
const savedFilters = ref([])

// Cargar filtros guardados del localStorage
const loadSavedFilters = () => {
  try {
    const saved = localStorage.getItem(props.storageKey)
    if (saved) {
      savedFilters.value = JSON.parse(saved)
    }
  } catch (e) {
    console.error('Error loading saved filters:', e)
  }
}

loadSavedFilters()

const hasActiveFilters = computed(() => activeFilters.value.length > 0)

const isFilterActive = (filterId) => {
  return activeFilters.value.includes(filterId)
}

const toggleFilter = (filterId) => {
  if (isFilterActive(filterId)) {
    removeFilter(filterId)
  } else {
    activeFilters.value.push(filterId)
    emit('update:modelValue', activeFilters.value)
    emit('filter-change', activeFilters.value)
  }
}

const removeFilter = (filterId) => {
  activeFilters.value = activeFilters.value.filter(id => id !== filterId)
  emit('update:modelValue', activeFilters.value)
  emit('filter-change', activeFilters.value)
}

const clearAllFilters = () => {
  activeFilters.value = []
  emit('update:modelValue', activeFilters.value)
  emit('filter-change', activeFilters.value)
}

const saveFavoriteFilter = () => {
  const name = prompt('Nombre para este conjunto de filtros:')
  if (!name) return

  const newSaved = {
    id: Date.now().toString(),
    name,
    filters: [...activeFilters.value]
  }

  savedFilters.value.push(newSaved)
  
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(savedFilters.value))
  } catch (e) {
    console.error('Error saving filter:', e)
  }
}

const loadSavedFilter = (saved) => {
  activeFilters.value = [...saved.filters]
  emit('update:modelValue', activeFilters.value)
  emit('filter-change', activeFilters.value)
}

const deleteSavedFilter = (id) => {
  savedFilters.value = savedFilters.value.filter(f => f.id !== id)
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(savedFilters.value))
  } catch (e) {
    console.error('Error deleting filter:', e)
  }
}
</script>

<style scoped>
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.filter-title i {
  color: #667eea;
}

.btn-clear-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-filters:hover {
  background: #fdd;
  border-color: #fbb;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.active-filters-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border: 1px solid #bae6fd;
  margin-top: 1rem;
}

.summary-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0369a1;
  font-size: 0.875rem;
  font-weight: 500;
}

.summary-text i {
  color: #0ea5e9;
}

.btn-save-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  color: #0369a1;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-filter:hover {
  background: #0ea5e9;
  color: white;
}

.saved-filters {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.saved-filters-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.saved-filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.saved-filter-item {
  display: flex;
  gap: 0.5rem;
}

.btn-load-filter {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.btn-load-filter:hover {
  background: #fde68a;
  border-color: #fbbf24;
}

.btn-load-filter i {
  color: #f59e0b;
}

.btn-delete-saved {
  padding: 0.625rem;
  background: white;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-saved:hover {
  background: #fee;
  border-color: #fca5a5;
}

@media (max-width: 768px) {
  .filter-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .active-filters-summary {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-save-filter {
    width: 100%;
    justify-content: center;
  }
}
</style>
