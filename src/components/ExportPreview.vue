<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="export-preview-modal animate__animated animate__fadeInUp animate__faster">
          <div class="modal-header">
            <h2>
              <i class="fa-solid fa-file-export"></i>
              Vista Previa de Exportación
            </h2>
            <button class="btn-close" @click="close" aria-label="Cerrar">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <!-- Configuración -->
            <div class="export-config">
              <div class="config-section">
                <h3>
                  <i class="fa-solid fa-cog"></i>
                  Configuración
                </h3>
                <div class="config-grid">
                  <div class="config-item">
                    <label>Formato:</label>
                    <select v-model="exportFormat" class="select-input">
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="csv">CSV (.csv)</option>
                      <option value="pdf">PDF (.pdf)</option>
                    </select>
                  </div>
                  <div class="config-item">
                    <label>Registros:</label>
                    <span class="config-value">{{ previewData.length }} de {{ totalRecords }}</span>
                  </div>
                </div>
              </div>

              <!-- Selección de columnas -->
              <div class="columns-section">
                <h3>
                  <i class="fa-solid fa-columns"></i>
                  Columnas a exportar
                </h3>
                <div class="columns-grid">
                  <label 
                    v-for="col in columns" 
                    :key="col.key"
                    class="column-checkbox"
                  >
                    <input 
                      type="checkbox" 
                      :value="col.key"
                      v-model="selectedColumns"
                    />
                    <span>{{ col.label }}</span>
                  </label>
                </div>
                <div class="columns-actions">
                  <button class="btn-link" @click="selectAllColumns">Seleccionar todo</button>
                  <button class="btn-link" @click="deselectAllColumns">Deseleccionar todo</button>
                </div>
              </div>
            </div>

            <!-- Vista previa de datos -->
            <div class="preview-section">
              <h3>
                <i class="fa-solid fa-eye"></i>
                Vista Previa (primeras 5 filas)
              </h3>
              <div class="preview-table-container">
                <table class="preview-table">
                  <thead>
                    <tr>
                      <th v-for="col in visibleColumns" :key="col.key">
                        {{ col.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in previewRows" :key="idx">
                      <td v-for="col in visibleColumns" :key="col.key">
                        {{ formatValue(row[col.key]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="preview-note">
                <i class="fa-solid fa-info-circle"></i>
                Esta es una vista previa. El archivo completo contendrá {{ previewData.length }} registros.
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="close">
              Cancelar
            </button>
            <button 
              class="btn-primary" 
              @click="confirmExport"
              :disabled="selectedColumns.length === 0"
            >
              <i class="fa-solid fa-download"></i>
              Exportar {{ exportFormat.toUpperCase() }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  totalRecords: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'export'])

const exportFormat = ref('excel')
const selectedColumns = ref([])

// Inicializar con todas las columnas seleccionadas
watch(() => props.show, (newVal) => {
  if (newVal && selectedColumns.value.length === 0) {
    selectedColumns.value = props.columns.map(c => c.key)
  }
})

const previewData = computed(() => props.data)

const visibleColumns = computed(() => {
  return props.columns.filter(col => selectedColumns.value.includes(col.key))
})

const previewRows = computed(() => {
  return previewData.value.slice(0, 5)
})

const formatValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return value
}

const selectAllColumns = () => {
  selectedColumns.value = props.columns.map(c => c.key)
}

const deselectAllColumns = () => {
  selectedColumns.value = []
}

const close = () => {
  emit('close')
}

const confirmExport = () => {
  emit('export', {
    format: exportFormat.value,
    columns: selectedColumns.value,
    visibleColumns: visibleColumns.value
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.export-preview-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.modal-header i {
  color: #667eea;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.export-config {
  margin-bottom: 2rem;
}

.config-section, .columns-section, .preview-section {
  margin-bottom: 1.5rem;
}

.config-section h3, .columns-section h3, .preview-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.config-section h3 i, .columns-section h3 i, .preview-section h3 i {
  color: #667eea;
  font-size: 0.875rem;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.config-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.select-input {
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.config-value {
  padding: 0.625rem;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.column-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.column-checkbox:hover {
  background: #f3f4f6;
  border-color: #667eea;
}

.column-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.column-checkbox span {
  font-size: 0.875rem;
  color: #374151;
}

.columns-actions {
  display: flex;
  gap: 1rem;
}

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.btn-link:hover {
  color: #764ba2;
}

.preview-table-container {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.preview-table thead {
  background: #f9fafb;
}

.preview-table th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.preview-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.preview-table tbody tr:hover {
  background: #f9fafb;
}

.preview-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #1e40af;
}

.preview-note i {
  color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary, .btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }

  .columns-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-secondary, .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
