<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Materia Prima' : 'Nueva Materia Prima' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="codigo">Código *</label>
                <input id="codigo" v-model="form.codigo" required maxlength="50" placeholder="Ej: MP-001" />
              </div>

              <div class="form-field">
                <label for="nombre">Nombre *</label>
                <input id="nombre" v-model="form.nombre" required maxlength="100" placeholder="Ej: Polietileno" />
              </div>

              <div class="form-field">
                <label for="categoria_id">Categoría *</label>
                <select id="categoria_id" v-model="form.categoria_id" required @change="form.categoria_id = parseInt(form.categoria_id)">
                  <option value="">-- Selecciona una categoría --</option>
                  <option v-if="categorias.length === 0" disabled>Cargando categorías...</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="String(cat.id)">
                    {{ cat.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="unidad_id">Unidad de Medida *</label>
                <select id="unidad_id" v-model.number="form.unidad_id" required>
                  <option value="" disabled>Selecciona una unidad</option>
                  <option v-for="u in unidades" :key="u.id" :value="u.id">
                    {{ u.nombre }} ({{ u.simbolo }})
                  </option>
                </select>
              </div>

              <div class="form-field">
                <label for="densidad">Densidad (g/cm³)</label>
                <input 
                  id="densidad" 
                  v-model.number="form.densidad" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="Ej: 0.95"
                />
              </div>

              <div class="form-field">
                <label for="stock_minimo">Stock Mínimo *</label>
                <input 
                  id="stock_minimo" 
                  v-model.number="form.stock_minimo" 
                  type="number" 
                  step="1" 
                  min="0" 
                  required
                  placeholder="0"
                />
              </div>

              <div class="form-field">
                <label for="stock_maximo">Stock Máximo</label>
                <input 
                  id="stock_maximo" 
                  v-model.number="form.stock_maximo" 
                  type="number" 
                  step="1" 
                  min="0" 
                  placeholder="Opcional"
                />
              </div>

              <div class="form-field full">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" v-model="form.descripcion" rows="2" placeholder="Descripción opcional"></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">{{ isEdit ? 'Actualizar' : 'Crear' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import materiasPrimasService from '../services/materiasPrimasService'
import categoriasService from '../services/categoriasService'

const props = defineProps({
  show: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)
const unidades = ref([])
const categorias = ref([])

const form = reactive({
  codigo: '',
  nombre: '',
  descripcion: '',
  categoria_id: null,
  unidad_id: '',
  densidad: null,
  stock_minimo: 0,
  stock_maximo: null
})

watch(() => props.show, (v) => { 
  visible.value = v
  if (v) {
    if (props.editId) {
      loadMateriaPrima(props.editId)
    } else {
      resetForm()
    }
  }
})

watch(() => props.editId, (id) => { 
  isEdit.value = !!id
  if (id && props.show) loadMateriaPrima(id) 
})

onMounted(() => {
  fetchUnidades()
  fetchCategorias()
})

async function fetchUnidades() {
  try {
    const token = localStorage.getItem('access_token')
    const response = await fetch('http://localhost:8000/api/unidades/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    unidades.value = Array.isArray(data) ? data : data.results || []
  } catch (e) {
    console.error('Error al cargar unidades', e)
  }
}

async function fetchCategorias() {
  try {
    const data = await categoriasService.getCategoriasByTipo('RAW_MATERIAL')
    console.log('Categorías cargadas (Materia Prima):', data)
    if (Array.isArray(data)) {
      categorias.value = data
    } else if (data && data.results && Array.isArray(data.results)) {
      categorias.value = data.results
    } else {
      console.warn('Formato de categorías inesperado:', data)
      categorias.value = []
    }
  } catch (e) {
    console.error('Error al cargar categorías', e)
    categorias.value = []
  }
}

function resetForm() {
  form.codigo = ''
  form.nombre = ''
  form.descripcion = ''
  form.categoria_id = null
  form.unidad_id = ''
  form.densidad = null
  form.stock_minimo = 0
  form.stock_maximo = null
  isEdit.value = false
}

async function loadMateriaPrima(id) {
  try {
    loading.value = true
    const data = await materiasPrimasService.getMateriaPrima(id)
    form.codigo = data.codigo
    form.nombre = data.nombre
    form.descripcion = data.descripcion || ''
    form.categoria_id = data.categoria_id || null
    form.unidad_id = data.unidad_id || data.unidad
    form.densidad = data.densidad || null
    form.stock_minimo = data.stock_minimo || 0
    form.stock_maximo = data.stock_maximo || null
    isEdit.value = true
  } catch (e) {
    console.error('Error al cargar materia prima', e)
  } finally {
    loading.value = false
  }
}

async function submit() {
  try {
    loading.value = true

    // Validar que categoria_id esté seleccionada
    if (!form.categoria_id || form.categoria_id === '') {
      alert('Por favor selecciona una categoría')
      loading.value = false
      return
    }

    const payload = {
      codigo: form.codigo,
      nombre: form.nombre,
      descripcion: form.descripcion || '',
      categoria_id: parseInt(form.categoria_id),
      unidad_id: parseInt(form.unidad_id),
      stock_minimo: parseInt(form.stock_minimo) || 0
    }

    if (form.densidad !== null && form.densidad !== '') {
      payload.densidad = parseFloat(form.densidad)
    }

    if (form.stock_maximo !== null && form.stock_maximo !== '') {
      payload.stock_maximo = parseInt(form.stock_maximo)
    }

    if (props.editId) {
      await materiasPrimasService.updateMateriaPrima(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await materiasPrimasService.createMateriaPrima(payload)
      emit('saved', { action: 'created' })
    }

    // Pequeño delay para que la notificación se muestre antes de cerrar el modal
    setTimeout(() => {
      close()
    }, 100)
  } catch (e) {
    console.error('Error guardando materia prima', e)
    alert(`Error al guardar: ${e.response?.data?.detail || e.message}`)
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  resetForm()
  emit('close')
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
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.dialog-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.modal-header .btn-icon {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.modal-header .btn-icon:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #4f6f8f;
  box-shadow: 0 0 0 3px rgba(79, 111, 143, 0.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 111, 143, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-active .dialog-card,
.dialog-fade-leave-active .dialog-card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .dialog-card,
.dialog-fade-leave-to .dialog-card {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-field.full {
    grid-column: 1;
  }
}
</style>
