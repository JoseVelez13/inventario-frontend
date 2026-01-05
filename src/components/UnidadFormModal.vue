<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Unidad' : 'Nueva Unidad' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="nombre">Nombre *</label>
                <input 
                  id="nombre" 
                  v-model="form.nombre" 
                  required
                  maxlength="50" 
                  placeholder="Ej: Kilogramo"
                />
              </div>

              <div class="form-field">
                <label for="simbolo">Símbolo *</label>
                <input 
                  id="simbolo" 
                  v-model="form.simbolo" 
                  required
                  maxlength="10" 
                  placeholder="Ej: kg"
                />
              </div>

              <div class="form-field full">
                <label for="factor_conversion">Factor de Conversión</label>
                <input 
                  id="factor_conversion" 
                  v-model.number="form.factor_conversion" 
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="Ej: 1.0 (opcional)"
                />
                <small class="help-text">
                  Factor para convertir a la unidad base. Ej: 1 kg = 1000 g, entonces g tiene factor 0.001
                </small>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="close">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ isEdit ? 'Actualizar' : 'Crear' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import unidadesService from '../services/unidadesService'

const props = defineProps({
  visible: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const isEdit = ref(false)
const loading = ref(false)

const form = reactive({
  nombre: '',
  simbolo: '',
  factor_conversion: null
})

watch(() => props.editId, (id) => { 
  if (id) {
    loadUnidad(id)
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.nombre = ''
  form.simbolo = ''
  form.factor_conversion = null
  isEdit.value = false
}

async function loadUnidad(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await unidadesService.getUnidad(id)
    form.nombre = data.nombre || ''
    form.simbolo = data.simbolo || ''
    form.factor_conversion = data.factor_conversion || null
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando unidad para editar', e)
  } finally {
    loading.value = false
  }
}

function close() {
  resetForm()
  emit('close')
}

async function submit() {
  try {
    const payload = {
      nombre: form.nombre,
      simbolo: form.simbolo,
      factor_conversion: form.factor_conversion || null
    }

    if (props.editId) {
      await unidadesService.updateUnidad(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await unidadesService.createUnidad(payload)
      emit('saved', { action: 'created' })
    }

    setTimeout(() => {
      close()
    }, 100)
  } catch (e) {
    console.error('Error guardando unidad', e)
  }
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.dialog-card {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
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
  margin: 0;
  font-size: 1.5rem;
  color: #1f2937;
}

.content {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-field input {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-field input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  transition: color 0.2s;
}

.btn-icon:hover {
  color: #374151;
}

.btn-primary, .btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
