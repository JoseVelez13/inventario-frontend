<template>
  <div v-if="visible" class="modal-overlay" @click="closeIfOutside">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? 'Editar Material' : 'Agregar Material de Producción' }}</h2>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submit" class="form-grid">
          <!-- Materia Prima -->
          <div class="form-field full animate__animated animate__fadeIn" style="animation-delay: 0.05s">
            <label for="raw_material">Materia Prima *</label>
            <select v-model.number="form.raw_material" id="raw_material" required>
              <option value="">-- Selecciona una materia prima --</option>
              <option v-for="mp in materiasPrimas" :key="mp.id" :value="mp.id">
                {{ mp.name }} ({{ mp.materia_prima_codigo }}) - Stock: {{ mp.stock }}
              </option>
            </select>
            <small class="help-text">Material que se utilizó en este lote</small>
          </div>

          <!-- Cantidad Usada -->
          <div class="form-field animate__animated animate__fadeIn" style="animation-delay: 0.10s">
            <label for="used_quantity">Cantidad Usada *</label>
            <input 
              id="used_quantity" 
              v-model.number="form.used_quantity" 
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
            <small class="help-text">Cantidad total utilizada del material</small>
          </div>

          <!-- Unidad -->
          <div class="form-field animate__animated animate__fadeIn" style="animation-delay: 0.15s">
            <label for="unit">Unidad de Medida *</label>
            <select v-model.number="form.unit" id="unit" required>
              <option value="">-- Selecciona una unidad --</option>
              <option v-for="u in unidades" :key="u.id" :value="u.id">
                {{ u.nombre }} ({{ u.simbolo }})
              </option>
            </select>
            <small class="help-text">Unidad de medida del material</small>
          </div>

          <!-- Info de Stock -->
          <div v-if="selectedMaterial" class="form-field full alert-info">
            <div>
              <strong>{{ selectedMaterial.name }}</strong>
              <div class="stock-info">
                <span>Stock Actual: <strong>{{ selectedMaterial.stock }}</strong></span>
                <span>Mín: {{ selectedMaterial.stock_minimo }}</span>
                <span>Máx: {{ selectedMaterial.stock_maximo || '-' }}</span>
              </div>
            </div>
          </div>

          <div v-if="isEdit" class="alert-info full">
            <i class="fa-solid fa-info-circle"></i>
            Los cambios se reflejarán en el lote inmediatamente.
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button 
          class="btn-primary" 
          @click="submit"
          :disabled="loading"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Agregar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted } from 'vue'
import loteProduccionService from '../services/loteProduccionService'
import materiasPrimasService from '../services/materiasPrimasService'
import unidadesService from '../services/unidadesService'

const props = defineProps({
  show: { type: Boolean, default: false },
  loteId: { type: [String, Number], required: true },
  materialId: { type: [String, Number], default: null }
})

const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)
const materiasPrimas = ref([])
const unidades = ref([])

const form = reactive({
  raw_material: '',
  used_quantity: 0,
  unit: ''
})

const selectedMaterial = computed(() => {
  return materiasPrimas.value.find(m => m.id === form.raw_material)
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.materialId, (id) => { if (id) loadMaterial(id) })

function resetForm() {
  form.raw_material = ''
  form.used_quantity = 0
  form.unit = ''
  isEdit.value = false
}

async function loadMateriasPrimas() {
  try {
    const data = await materiasPrimasService.getMateriasPrimas()
    materiasPrimas.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando materias primas:', err)
  }
}

async function loadUnidades() {
  try {
    const data = await unidadesService.getUnidades()
    unidades.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando unidades:', err)
  }
}

async function loadMaterial(id) {
  try {
    const data = await loteProduccionService.getMaterialesByLote(props.loteId)
    const material = data.find(m => m.id === id)
    if (material) {
      form.raw_material = material.raw_material
      form.used_quantity = material.used_quantity
      form.unit = material.unit
      isEdit.value = true
    }
  } catch (err) {
    console.error('Error cargando material:', err)
  }
}

async function submit() {
  try {
    loading.value = true
    
    if (isEdit.value) {
      await loteProduccionService.updateMaterialInLote(
        props.loteId,
        props.materialId,
        form
      )
    } else {
      await loteProduccionService.addMaterialToLote(props.loteId, form)
    }
    
    emit('saved')
    close()
  } catch (err) {
    console.error('Error guardando material:', err)
    alert('Error al guardar el material: ' + (err.response?.data?.detail || err.message))
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  resetForm()
  emit('close')
}

function closeIfOutside(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

onMounted(() => {
  loadMateriasPrimas()
  loadUnidades()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #6B7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.btn-close:hover {
  background: #E5E7EB;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-grid .full {
  grid-column: 1 / -1;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-field input,
.form-field select {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.15s ease;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  font-size: 12px;
  color: #6B7280;
}

.alert-info {
  background: #EFF6FF;
  border: 1px solid #93C5FD;
  border-radius: 6px;
  padding: 12px;
  color: #1E40AF;
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.stock-info {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 13px;
  color: #1E40AF;
}

.stock-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.btn-primary, .btn-secondary {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover {
  background: #2563EB;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.btn-secondary {
  background: #E5E7EB;
  color: #374151;
}

.btn-secondary:hover {
  background: #D1D5DB;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid .full {
    grid-column: 1;
  }
}
</style>
