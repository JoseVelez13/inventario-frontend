<template>
  <transition name="fade-in-up" appear>
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Recepción' : 'Nueva Recepción de Material' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="materia_prima">Materia Prima *</label>
                <select 
                  id="materia_prima" 
                  v-model="form.materia_prima" 
                  required
                  :disabled="isEdit"
                >
                  <option value="">Seleccionar...</option>
                  <option 
                    v-for="mp in materiasPrimasFiltered" 
                    :key="mp.materia_prima_id" 
                    :value="mp.materia_prima_id"
                  >
                    {{ mp.codigo }} - {{ mp.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="cantidad">Cantidad *</label>
                <input 
                  id="cantidad" 
                  v-model.number="form.cantidad" 
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Ej: 100.50"
                />
              </div>

              <div class="form-field">
                <label for="costo_unitario">Costo Unitario *</label>
                <input 
                  id="costo_unitario" 
                  v-model.number="form.costo_unitario" 
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Ej: 15.50"
                />
              </div>

              <div class="form-field">
                <label>Total</label>
                <input 
                  :value="formatTotal" 
                  type="text"
                  disabled
                  class="input-readonly"
                />
              </div>

              <div class="form-field">
                <label for="proveedor">Proveedor *</label>
                <select 
                  id="proveedor" 
                  v-model="form.proveedor" 
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option v-for="prov in proveedoresFiltered" :key="prov.proveedor_id" :value="prov.proveedor_id">
                    {{ prov.nombre_empresa }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="almacen">Almacén *</label>
                <select 
                  id="almacen" 
                  v-model="form.almacen" 
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option v-for="alm in almacenesFiltered" :key="alm.id" :value="alm.id">
                    {{ alm.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="fecha_de_recepcion">Fecha de Recepción *</label>
                <input 
                  id="fecha_de_recepcion" 
                  v-model="form.fecha_de_recepcion" 
                  type="date"
                  required
                />
              </div>

              <div class="form-field">
                <label for="numero_de_factura">Número de Factura</label>
                <input 
                  id="numero_de_factura" 
                  v-model="form.numero_de_factura" 
                  type="text"
                  maxlength="50"
                  placeholder="Ej: FAC-001-2026"
                />
              </div>

              <div class="form-field full">
                <label for="observaciones">Observaciones</label>
                <textarea 
                  id="observaciones" 
                  v-model="form.observaciones" 
                  rows="3"
                  placeholder="Observaciones adicionales sobre la recepción..."
                ></textarea>
              </div>
            </div>

            <div v-if="isEdit" class="alert-info">
              <i class="fa-solid fa-info-circle"></i>
              Al modificar esta recepción se actualizarán automáticamente los movimientos del Kardex
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="close">Cancelar</button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                {{ submitting ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import recepcionesService from '../services/recepcionesService'
import materiasPrimasService from '../services/materiasPrimasService'
import proveedoresService from '../services/proveedoresService'
import almacenesService from '../services/almacenesService'

const props = defineProps({
  visible: Boolean,
  recepcionId: [Number, String]
})

const emit = defineEmits(['close', 'saved', 'error'])

const form = ref({
  materia_prima: '',
  cantidad: '',
  costo_unitario: '',
  almacen: '',
  proveedor: '',
  fecha_de_recepcion: new Date().toISOString().split('T')[0],
  numero_de_factura: '',
  observaciones: ''
})

const materiasPrimas = ref([])
const proveedores = ref([])
const almacenes = ref([])
const submitting = ref(false)

// Computed para filtrar elementos null o inválidos
const materiasPrimasFiltered = computed(() => {
  return (materiasPrimas.value || []).filter(mp => mp && mp.materia_prima_id && mp.nombre)
})

const proveedoresFiltered = computed(() => {
  return (proveedores.value || []).filter(p => p && p.proveedor_id && p.nombre_empresa)
})

const almacenesFiltered = computed(() => {
  return (almacenes.value || []).filter(a => a && a.id && a.nombre)
})

const isEdit = computed(() => !!props.recepcionId)

const formatTotal = computed(() => {
  const total = (form.value.cantidad || 0) * (form.value.costo_unitario || 0)
  return `$${total.toFixed(2)}`
})

// Watchers
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadData()
    if (props.recepcionId) {
      loadRecepcion()
    } else {
      resetForm()
    }
  }
})

// Métodos
const loadData = async () => {
  try {
    const [mpData, provData, almData] = await Promise.all([
      materiasPrimasService.getMateriasPrimas({ page_size: 1000 }),
      proveedoresService.getProveedores({ page_size: 1000 }),
      almacenesService.getAlmacenes()
    ])
    
    materiasPrimas.value = Array.isArray(mpData) ? mpData : (mpData.results || [])
    proveedores.value = Array.isArray(provData) ? provData : (provData.results || [])
    almacenes.value = Array.isArray(almData) ? almData : (almData.results || [])
    
    console.log('Datos cargados:', {
      materiasPrimas: materiasPrimas.value.length,
      proveedores: proveedores.value.length,
      almacenes: almacenes.value.length
    })
  } catch (err) {
    console.error('Error cargando datos:', err)
  }
}

const loadRecepcion = async () => {
  try {
    const data = await recepcionesService.getRecepcionMaterial(props.recepcionId)
    form.value = {
      materia_prima: data.materia_prima,
      cantidad: data.cantidad,
      costo_unitario: data.costo_unitario,
      almacen: data.almacen,
      proveedor: data.proveedor,
      fecha_de_recepcion: data.fecha_de_recepcion,
      numero_de_factura: data.numero_de_factura || '',
      observaciones: data.observaciones || ''
    }
  } catch (err) {
    console.error('Error cargando recepción:', err)
    emit('close')
  }
}

const resetForm = () => {
  form.value = {
    materia_prima: '',
    cantidad: '',
    costo_unitario: '',
    almacen: '',
    proveedor: '',
    fecha_de_recepcion: new Date().toISOString().split('T')[0],
    numero_de_factura: '',
    observaciones: ''
  }
}

const submit = async () => {
  try {
    submitting.value = true
    
    // Enviar el form sin modificar el nombre del campo almacen
    const payload = { ...form.value }
    console.log('Payload being sent:', payload)
    console.log('Almacen value:', form.value.almacen)
    console.log('Almacenes available:', almacenes.value)
    
    if (isEdit.value) {
      await recepcionesService.updateRecepcionMaterial(props.recepcionId, payload)
    } else {
      await recepcionesService.createRecepcionMaterial(payload)
    }
    
    emit('saved')
    close()
  } catch (err) {
    console.error('Error guardando recepción:', err)
    
    let errorMsg = ''
    if (err.response?.status === 404) {
      errorMsg = 'El servidor no tiene configurado el endpoint para registrar recepciones de material. Por favor, verifica que el backend tenga la ruta /api/recepciones/ habilitada.'
    } else if (err.response?.data) {
      const errors = err.response.data
      if (typeof errors === 'string') {
        errorMsg = errors
      } else if (errors.detail) {
        errorMsg = errors.detail
      } else {
        for (const [field, messages] of Object.entries(errors)) {
          const fieldName = field === 'materia_prima' ? 'Materia Prima' :
                           field === 'proveedor' ? 'Proveedor' :
                           field === 'almacen' ? 'Almacén' :
                           field === 'cantidad' ? 'Cantidad' :
                           field === 'costo_unitario' ? 'Costo Unitario' :
                           field === 'fecha_recepcion' ? 'Fecha de Recepción' : field
          
          if (Array.isArray(messages)) {
            errorMsg += `${fieldName}: ${messages.join(', ')}. `
          } else {
            errorMsg += `${fieldName}: ${messages}. `
          }
        }
      }
    } else {
      errorMsg = 'Error al guardar la recepción. Por favor, intente nuevamente.'
    }
    
    emit('error', errorMsg || 'Error desconocido al guardar')
  } finally {
    submitting.value = false
  }
}

const close = () => {
  emit('close')
}

onMounted(() => {
  loadData()
})
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
  z-index: 10000;
  padding: 20px;
  backdrop-filter: blur(8px);
}

.dialog-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #111827;
}

.content {
  padding: 24px;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #4F6F8F;
  box-shadow: 0 0 0 3px rgba(79, 111, 143, 0.1);
}

.input-readonly {
  background: #F3F4F6;
  cursor: not-allowed;
}

.help-text {
  font-size: 12px;
  color: #6B7280;
}

.alert-info {
  background: #EFF6FF;
  border-left: 4px solid #3B82F6;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  color: #1E40AF;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background: #F3F4F6;
  color: #374151;
}

.btn-secondary:hover {
  background: #E5E7EB;
}

.btn-primary {
  background: #4F6F8F;
  color: white;
}

.btn-primary:hover {
  background: #3F5A75;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6B7280;
  padding: 4px 8px;
}

.btn-icon:hover {
  color: #111827;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.fade-in-up-enter-active, .fade-in-up-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-in-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-in-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
