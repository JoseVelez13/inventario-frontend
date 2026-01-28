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
          <div class="form-field full">
            <label for="raw_material">Materia Prima *</label>
            <select v-model.number="form.raw_material" id="raw_material" required @change="onMaterialChange">
              <option value="">-- Selecciona una materia prima --</option>
              <option v-for="mp in materiasPrimas" :key="mp.id" :value="mp.id">
                {{ mp.nombre }} ({{ mp.codigo }}) - Stock: {{ formatQuantity(mp.stock) }}
              </option>
            </select>
            <small class="help-text">Material que se utilizará en este lote</small>
          </div>

          <!-- Cantidad Usada -->
          <div class="form-field">
            <label for="used_quantity">Cantidad Usada *</label>
            <input 
              id="used_quantity" 
              v-model.number="form.used_quantity" 
              type="number"
              min="0.0001"
              step="0.0001"
              placeholder="0.0000"
              required
            />
            <small class="help-text">Cantidad utilizada (hasta 4 decimales)</small>
          </div>

          <!-- Unidad -->
          <div class="form-field">
            <label for="unit">Unidad de Medida *</label>
            <select v-model.number="form.unit" id="unit" required>
              <option value="">-- Selecciona una unidad --</option>
              <option v-for="u in unidades" :key="u.id" :value="u.id">
                {{ u.nombre }} ({{ u.simbolo }})
              </option>
            </select>
            <small class="help-text">Unidad de medida del material</small>
          </div>

          <!-- Info de Stock y Costos -->
          <div v-if="selectedMaterial" class="form-field full">
            <div class="material-info">
              <div class="info-header">
                <strong>{{ selectedMaterial.nombre }}</strong>
                <span class="material-code">{{ selectedMaterial.codigo }}</span>
              </div>
              
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Stock Disponible:</span>
                  <span class="value" :class="getStockClass(selectedMaterial)">
                    {{ formatQuantity(selectedMaterial.stock) }} {{ getUnitSymbol(selectedMaterial.unidad_medida) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">Stock Mínimo:</span>
                  <span class="value">{{ formatQuantity(selectedMaterial.stock_minimo) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Costo Promedio:</span>
                  <span class="value">${{ formatCost(selectedMaterial.costo_promedio) }}</span>
                </div>
                <div class="info-item" v-if="form.used_quantity > 0">
                  <span class="label">Costo Total Estimado:</span>
                  <span class="value cost-highlight">
                    ${{ formatCost(form.used_quantity * selectedMaterial.costo_promedio) }}
                  </span>
                </div>
              </div>

              <!-- Advertencia de stock bajo -->
              <div v-if="isStockInsufficient" class="alert-warning">
                <i class="fa-solid fa-exclamation-triangle"></i>
                Stock insuficiente. Disponible: {{ formatQuantity(selectedMaterial.stock) }}, 
                Necesario: {{ formatQuantity(form.used_quantity) }}
              </div>
            </div>
          </div>

          <div v-if="isEdit" class="alert-info full">
            <i class="fa-solid fa-info-circle"></i>
            Los costos se recalcularán automáticamente al guardar.
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Cancelar</button>
        <button 
          class="btn-primary" 
          @click="submit"
          :disabled="loading || isStockInsufficient"
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

const isStockInsufficient = computed(() => {
  if (!selectedMaterial.value || !form.used_quantity) return false
  return parseFloat(selectedMaterial.value.stock) < parseFloat(form.used_quantity)
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

function onMaterialChange() {
  // Auto-seleccionar la unidad de la materia prima
  if (selectedMaterial.value) {
    form.unit = selectedMaterial.value.unidad_medida
  }
}

function getUnitSymbol(unitId) {
  const unit = unidades.value.find(u => u.id === unitId)
  return unit ? unit.simbolo : ''
}

function getStockClass(material) {
  const stock = parseFloat(material.stock)
  const minimo = parseFloat(material.stock_minimo)
  
  if (stock <= 0) return 'stock-zero'
  if (stock < minimo) return 'stock-low'
  return 'stock-ok'
}

function formatQuantity(num) {
  if (!num) return '0.0000'
  return parseFloat(num).toFixed(4)
}

function formatCost(num) {
  if (!num) return '0.00'
  return parseFloat(num).toFixed(2)
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
  max-width: 600px;
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

.material-info {
  background: #F0F9FF;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #BAE6FD;
}

.info-header strong {
  color: #0369A1;
  font-size: 15px;
}

.material-code {
  background: #E0F2FE;
  color: #075985;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #0369A1;
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: #075985;
  font-weight: 600;
}

.stock-ok { color: #16A34A; }
.stock-low { color: #EA580C; }
.stock-zero { color: #DC2626; }

.cost-highlight {
  color: #7C3AED !important;
  font-size: 16px !important;
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

.alert-warning {
  background: #FEF3C7;
  border: 1px solid #FCD34D;
  border-radius: 6px;
  padding: 12px;
  color: #92400E;
  font-size: 13px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.alert-info i,
.alert-warning i {
  flex-shrink: 0;
  margin-top: 2px;
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

.btn-primary:hover:not(:disabled) {
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

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>