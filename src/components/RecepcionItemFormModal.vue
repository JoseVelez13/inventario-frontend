<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Recepción' : 'Nueva Recepción de Producto' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="producto">Producto *</label>
                <select 
                  id="producto" 
                  v-model="form.producto" 
                  required
                  :disabled="isEdit"
                >
                  <option value="">Seleccionar...</option>
                  <option v-for="prod in productos" :key="prod.id" :value="prod.id">
                    {{ prod.codigo }} - {{ prod.nombre }}
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
                  placeholder="Ej: 50.00"
                />
              </div>

              <div class="form-field">
                <label for="almacen">Almacén *</label>
                <select 
                  id="almacen" 
                  v-model="form.almacen" 
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option v-for="alm in almacenes" :key="alm.id" :value="alm.id">
                    {{ alm.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="fecha_recepcion">Fecha de Recepción *</label>
                <input 
                  id="fecha_recepcion" 
                  v-model="form.fecha_recepcion" 
                  type="date"
                  required
                />
              </div>

              <div class="form-field full">
                <label for="lote_produccion">Lote de Producción</label>
                <input 
                  id="lote_produccion" 
                  v-model="form.lote_produccion" 
                  type="text"
                  maxlength="50"
                  placeholder="Ej: LP000001"
                />
                <small class="help-text">
                  Opcional: Identificador del lote de producción
                </small>
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
import productosService from '../services/productosService'
import almacenesService from '../services/almacenesService'

const props = defineProps({
  visible: Boolean,
  recepcionId: [Number, String]
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  producto: '',
  cantidad: '',
  almacen: '',
  fecha_recepcion: new Date().toISOString().split('T')[0],
  lote_produccion: '',
  observaciones: ''
})

const productos = ref([])
const almacenes = ref([])
const submitting = ref(false)

const isEdit = computed(() => !!props.recepcionId)

const loadCatalogs = async () => {
  try {
    const [prod, alm] = await Promise.all([
      productosService.getProductos(),
      almacenesService.getAlmacenes()
    ])
    productos.value = prod
    almacenes.value = alm
  } catch (err) {
    console.error('Error cargando catálogos:', err)
  }
}

const loadRecepcion = async () => {
  if (!props.recepcionId) return
  
  try {
    const data = await recepcionesService.getRecepcionItem(props.recepcionId)
    form.value = {
      producto: data.producto,
      cantidad: data.cantidad,
      almacen: data.almacen,
      fecha_recepcion: data.fecha_recepcion,
      lote_produccion: data.lote_produccion || '',
      observaciones: data.observaciones || ''
    }
  } catch (err) {
    console.error('Error cargando recepción:', err)
  }
}

const submit = async () => {
  try {
    submitting.value = true
    
    if (isEdit.value) {
      await recepcionesService.updateRecepcionItem(props.recepcionId, form.value)
    } else {
      await recepcionesService.createRecepcionItem(form.value)
    }
    
    emit('saved')
    close()
  } catch (err) {
    console.error('Error guardando recepción:', err)
    alert('Error al guardar la recepción. Verifica los datos e intenta nuevamente.')
  } finally {
    submitting.value = false
  }
}

const close = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  form.value = {
    producto: '',
    cantidad: '',
    almacen: '',
    fecha_recepcion: new Date().toISOString().split('T')[0],
    lote_produccion: '',
    observaciones: ''
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    if (isEdit.value) {
      loadRecepcion()
    } else {
      resetForm()
    }
  }
})

onMounted(() => {
  loadCatalogs()
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
  z-index: 1000;
  padding: 20px;
}

.dialog-card {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  font-weight: 600;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #4F6F8F;
}

.help-text {
  font-size: 12px;
  color: #6B7280;
}

.alert-info {
  background: #DBEAFE;
  color: #1E40AF;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
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
</style>
