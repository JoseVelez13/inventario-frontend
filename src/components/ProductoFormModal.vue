<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="product_code">Código <span class="required">*</span></label>
                <input id="product_code" v-model="form.product_code" maxlength="50" placeholder="Ej: PROD-001"
                  @blur="validateField('product_code')" :class="{ 'input-error': errors.product_code }" />
                <FormErrorMessage :error="errors.product_code" />
              </div>

              <div class="form-field">
                <label for="name">Nombre <span class="required">*</span></label>
                <input id="name" v-model="form.name" maxlength="150" placeholder="Nombre del producto"
                  @blur="validateField('name')" :class="{ 'input-error': errors.name }" />
                <FormErrorMessage :error="errors.name" />
              </div>

              <div class="form-field">
                <label for="categoria_id">Categoría <span class="required">*</span></label>
                <select id="categoria_id" v-model.number="form.categoria_id" @change="validateField('categoria_id')"
                  :class="{ 'input-error': errors.categoria_id }">
                  <option :value="null">-- Selecciona una categoría --</option>
                  <option v-if="categorias.length === 0" :value="null" disabled>
                    Cargando categorías...
                  </option>
                  <option v-for="cat in categorias" :key="cat.categoria_id" :value="cat.categoria_id">
                    {{ cat.nombre }}
                  </option>
                </select>
                <FormErrorMessage :error="errors.categoria_id" />
              </div>

              <div class="form-field">
                <label for="unit">Unidad <span class="required">*</span></label>
                <select id="unit" v-model.number="form.unit" @change="validateField('unit')"
                  :class="{ 'input-error': errors.unit }">
                  <option value="">-- Selecciona una unidad --</option>
                  <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nombre }} ({{ u.simbolo }})</option>
                </select>
                <FormErrorMessage :error="errors.unit" />
              </div>

              <div class="form-field">
                <label for="weight">Peso (kg)</label>
                <input id="weight" v-model.number="form.weight" type="number" step="0.001" min="0" placeholder="0.000"
                  @blur="validateField('weight')" :class="{ 'input-error': errors.weight }" />
                <FormErrorMessage :error="errors.weight" />
              </div>

              <div class="form-field">
                <label for="stock">Stock</label>
                <input id="stock" v-model.number="form.stock" type="number" step="1" min="0" placeholder="0"
                  @blur="validateField('stock')" :class="{ 'input-error': errors.stock }" />
                <FormErrorMessage :error="errors.stock" />
              </div>

              <div class="form-field full">
                <label for="description">Descripción</label>
                <textarea id="description" v-model="form.description" placeholder="Descripción del producto"
                  @blur="validateField('description')" :class="{ 'input-error': errors.description }"></textarea>
                <FormErrorMessage :error="errors.description" />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading">
                {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, reactive, onMounted } from 'vue'
import productosService from '../services/productosService'
import categoriasService from '../services/categoriasService'
import FormErrorMessage from './FormErrorMessage.vue'
import { useFormValidation } from '../composables/useFormValidation'

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
const { errors, validators, validateField: validateFieldUtil, validateForm: validateFormUtil } = useFormValidation()

const form = reactive({
  product_code: '',
  name: '',
  description: '',
  categoria_id: null,
  unit: null,
  weight: 0.0,
  stock: 0
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.editId, (id) => { if (id) loadProducto(id) })

onMounted(() => {
  loadUnidades()
  loadCategorias()
})

function resetForm() {
  form.product_code = ''
  form.name = ''
  form.description = ''
  form.categoria_id = null
  form.unit = null
  form.weight = 0.0
  form.stock = 0
  isEdit.value = false
}

async function loadUnidades() {
  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch('http://localhost:8000/api/unidades/', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    unidades.value = Array.isArray(data) ? data : data.results || []
  } catch (e) {
    console.error('Error cargando unidades', e)
  }
}

async function loadCategorias() {
  try {
    const data = await categoriasService.getCategoriasByTipo('PRODUCT')
    console.log('Categorías cargadas:', data)
    if (Array.isArray(data)) {
      categorias.value = data
    } else if (data && data.results && Array.isArray(data.results)) {
      categorias.value = data.results
    } else {
      console.warn('Formato de categorías inesperado:', data)
      categorias.value = []
    }
  } catch (e) {
    console.error('Error cargando categorías', e)
    categorias.value = []
  }
}

async function loadProducto(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await productosService.getProducto(id)
    form.product_code = data.product_code || ''
    form.name = data.name || ''
    form.description = data.description || ''
    form.categoria_id = data.categoria_id || null
    form.unit = data.unit || null
    form.weight = data.weight || 0.0
    form.stock = data.stock || 0
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando producto', e)
  } finally {
    loading.value = false
  }
}

function validateField(fieldName) {
  const validationRules = {
    product_code: [
      (value) => validators.required(value, 'Código'),
      (value) => validators.minLength(value, 2, 'Código')
    ],
    name: [
      (value) => validators.required(value, 'Nombre'),
      (value) => validators.minLength(value, 3, 'Nombre')
    ],
    categoria_id: [
      (value) => validators.required(value, 'Categoría')
    ],
    unit: [
      (value) => validators.required(value, 'Unidad')
    ],
    weight: [
      (value) => validators.minValue(value, 0, 'Peso')
    ],
    stock: [
      (value) => validators.minValue(value, 0, 'Stock')
    ]
  }

  if (validationRules[fieldName]) {
    validateFieldUtil(fieldName, form[fieldName], validationRules[fieldName])
  }
}

function close() {
  visible.value = false
  resetForm()
  emit('close')
}

async function submit() {
  const validationRules = {
    product_code: [
      (value) => validators.required(value, 'Código'),
      (value) => validators.minLength(value, 2, 'Código')
    ],
    name: [
      (value) => validators.required(value, 'Nombre'),
      (value) => validators.minLength(value, 3, 'Nombre')
    ],
    categoria_id: [
      (value) => validators.required(value, 'Categoría')
    ],
    unit: [
      (value) => validators.required(value, 'Unidad')
    ]
  }

  if (!validateFormUtil(form, validationRules)) {
    return
  }

  try {
    loading.value = true
    const payload = {
      product_code: form.product_code,
      name: form.name,
      description: form.description || null,
      categoria_id: parseInt(form.categoria_id),
      unit: form.unit || 1,
      weight: form.weight || 0,
      stock: form.stock || 0
    }

    if (props.editId) {
      await productosService.updateProducto(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await productosService.createProducto(payload)
      emit('saved', { action: 'created' })
    }

    // Pequeño delay para que la notificación se muestre antes de cerrar el modal
    setTimeout(() => {
      close()
    }, 100)
  } catch (e) {
    console.error('Error guardando producto', e)
    alert(`Error al guardar: ${e.response?.data?.detail || e.message}`)
  } finally {
    loading.value = false
  }
}

loadUnidades()
loadCategorias()
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

.form-field input.input-error,
.form-field select.input-error,
.form-field textarea.input-error {
  border-color: #f87171;
  background-color: #fef2f2;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #4f6f8f;
  box-shadow: 0 0 0 3px rgba(79, 111, 143, 0.1);
}

.form-field input.input-error:focus,
.form-field select.input-error:focus,
.form-field textarea.input-error:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
}

.required {
  color: #f87171;
  font-weight: bold;
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
