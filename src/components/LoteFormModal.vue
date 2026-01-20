<template>
  <div v-if="visible" class="modal-overlay" @click="closeIfOutside">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? 'Editar Lote de Producción' : 'Nuevo Lote de Producción' }}</h2>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submit" class="form-grid">
          <!-- Código del Lote -->
          <div class="form-field">
            <label for="batch_code">Código del Lote *</label>
            <input 
              id="batch_code" 
              v-model="form.batch_code" 
              type="text"
              maxlength="50"
              placeholder="Ej: LP001-2025"
              required
            />
            <small class="help-text">Identificador único del lote (máx. 50 caracteres)</small>
          </div>

          <!-- Producto -->
          <div class="form-field">
            <label for="product">Producto *</label>
            <select v-model.number="form.product" id="product" required>
              <option value="">-- Selecciona un producto --</option>
              <option v-for="prod in productos" :key="prod.id" :value="prod.id">
                {{ prod.name }} ({{ prod.product_code }})
              </option>
            </select>
            <small class="help-text">Producto a producir en este lote</small>
          </div>

          <!-- Fecha de Producción -->
          <div class="form-field">
            <label for="production_date">Fecha de Producción *</label>
            <input 
              id="production_date" 
              v-model="form.production_date" 
              type="date"
              required
            />
            <small class="help-text">Fecha en que se produjo el lote</small>
          </div>

          <!-- Cantidad Producida -->
          <div class="form-field">
            <label for="produced_quantity">Cantidad Producida *</label>
            <input 
              id="produced_quantity" 
              v-model.number="form.produced_quantity" 
              type="number"
              min="1"
              step="1"
              placeholder="100"
              required
            />
            <small class="help-text">Cantidad total producida (unidades enteras)</small>
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
            <small class="help-text">Unidad de medida del producto</small>
          </div>

          <!-- Estado -->
          <div class="form-field">
            <label for="status">Estado *</label>
            <select v-model="form.status" id="status" required>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Proceso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <small class="help-text">Estado actual del lote</small>
          </div>

          <!-- Gestor de Producción -->
          <div class="form-field">
            <label for="production_manager">Gestor de Producción *</label>
            <select v-model.number="form.production_manager" id="production_manager" required>
              <option value="">-- Selecciona un gestor --</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.first_name || user.username }}
              </option>
            </select>
            <small class="help-text">Usuario responsable de este lote</small>
          </div>

          <!-- Observaciones (opcional) -->
          <div class="form-field full">
            <label for="observaciones">Observaciones</label>
            <textarea 
              id="observaciones" 
              v-model="form.observaciones" 
              rows="3"
              placeholder="Notas adicionales sobre la producción..."
            ></textarea>
            <small class="help-text">Información adicional (opcional)</small>
          </div>

          <div v-if="isEdit" class="alert-info full">
            <i class="fa-solid fa-info-circle"></i>
            Editando lote existente. Los cambios se reflejarán inmediatamente.
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Cancelar</button>
        <button 
          class="btn-primary" 
          @click="submit"
          :disabled="loading"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted } from 'vue'
import loteProduccionService from '../services/loteProduccionService'
import productosService from '../services/productosService'
import unidadesService from '../services/unidadesService'
import usuariosService from '../services/usuariosService'

const props = defineProps({
  show: { type: Boolean, default: false },
  loteId: { type: [String, Number], default: null }
})

const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)
const productos = ref([])
const unidades = ref([])
const users = ref([])

const form = reactive({
  batch_code: '',
  product: '',
  production_date: new Date().toISOString().split('T')[0],
  produced_quantity: 0,
  unit: '',
  status: 'pending',
  production_manager: '',
  observaciones: ''
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.loteId, (id) => { if (id) loadLote(id) })

function resetForm() {
  form.batch_code = ''
  form.product = ''
  form.production_date = new Date().toISOString().split('T')[0]
  form.produced_quantity = 0
  form.unit = ''
  form.status = 'pending'
  form.production_manager = ''
  form.observaciones = ''
  isEdit.value = false
}

async function loadProductos() {
  try {
    const data = await productosService.getProductos()
    productos.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando productos:', err)
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

async function loadUsers() {
  try {
    const data = await usuariosService.getUsuarios()
    users.value = Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error('Error cargando usuarios:', err)
  }
}

async function loadLote(id) {
  try {
    const data = await loteProduccionService.getLoteProduccion(id)
    form.batch_code = data.batch_code
    form.product = data.product
    form.production_date = data.production_date
    form.produced_quantity = data.produced_quantity
    form.unit = data.unit
    form.status = data.status
    form.production_manager = data.production_manager
    form.observaciones = data.observaciones || ''
    isEdit.value = true
  } catch (err) {
    console.error('Error cargando lote:', err)
  }
}

async function submit() {
  try {
    loading.value = true
    
    if (isEdit.value) {
      await loteProduccionService.updateLoteProduccion(props.loteId, form)
    } else {
      await loteProduccionService.createLoteProduccion(form)
    }
    
    emit('saved')
    close()
  } catch (err) {
    console.error('Error guardando lote:', err)
    alert('Error al guardar el lote: ' + (err.response?.data?.detail || err.message))
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
  loadProductos()
  loadUnidades()
  loadUsers()
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
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.15s ease;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field input:disabled {
  background: #F3F4F6;
  color: #9CA3AF;
  cursor: not-allowed;
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

.alert-info i {
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
