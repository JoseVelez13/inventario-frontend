<!-- TEMPLATE: Formulario Modal con Validaciones -->
<!-- Copia y personaliza este código para crear nuevos formularios con validaciones -->

<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Item' : 'Nuevo Item' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <!-- CAMPO EJEMPLO 1: Texto Requerido -->
              <div class="form-field">
                <label for="nombre">Nombre <span class="required">*</span></label>
                <input 
                  id="nombre" 
                  v-model="form.nombre"
                  maxlength="100"
                  placeholder="Ej: Mi Item"
                  @blur="validateField('nombre')"
                  :class="{ 'input-error': errors.nombre }"
                />
                <FormErrorMessage :error="errors.nombre" />
              </div>

              <!-- CAMPO EJEMPLO 2: Email (Opcional) -->
              <div class="form-field">
                <label for="email">Email</label>
                <input 
                  id="email"
                  type="email"
                  v-model="form.email"
                  maxlength="100"
                  placeholder="correo@ejemplo.com"
                  @blur="validateField('email')"
                  :class="{ 'input-error': errors.email }"
                />
                <FormErrorMessage :error="errors.email" />
              </div>

              <!-- CAMPO EJEMPLO 3: Número -->
              <div class="form-field">
                <label for="cantidad">Cantidad <span class="required">*</span></label>
                <input 
                  id="cantidad"
                  v-model.number="form.cantidad"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  @blur="validateField('cantidad')"
                  :class="{ 'input-error': errors.cantidad }"
                />
                <FormErrorMessage :error="errors.cantidad" />
              </div>

              <!-- CAMPO EJEMPLO 4: Select Requerido -->
              <div class="form-field">
                <label for="categoria">Categoría <span class="required">*</span></label>
                <select 
                  id="categoria"
                  v-model="form.categoria"
                  @change="validateField('categoria')"
                  :class="{ 'input-error': errors.categoria }"
                >
                  <option value="">-- Selecciona una categoría --</option>
                  <option value="1">Opción 1</option>
                  <option value="2">Opción 2</option>
                </select>
                <FormErrorMessage :error="errors.categoria" />
              </div>

              <!-- CAMPO EJEMPLO 5: Textarea -->
              <div class="form-field full">
                <label for="descripcion">Descripción</label>
                <textarea 
                  id="descripcion"
                  v-model="form.descripcion"
                  rows="3"
                  placeholder="Descripción opcional"
                  @blur="validateField('descripcion')"
                  :class="{ 'input-error': errors.descripcion }"
                ></textarea>
                <FormErrorMessage :error="errors.descripcion" />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="close">Cancelar</button>
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
import { ref, watch, reactive } from 'vue'
import FormErrorMessage from './FormErrorMessage.vue'
import { useFormValidation } from '../composables/useFormValidation'
// import miService from '../services/miService'  // Descomenta y reemplaza según necesites

const props = defineProps({
  show: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)
const { errors, validators, validateField: validateFieldUtil, validateForm: validateFormUtil } = useFormValidation()

const form = reactive({
  nombre: '',
  email: '',
  cantidad: 0,
  categoria: '',
  descripcion: ''
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.editId, (id) => { if (id) loadItem(id) })

function resetForm() {
  form.nombre = ''
  form.email = ''
  form.cantidad = 0
  form.categoria = ''
  form.descripcion = ''
  isEdit.value = false
}

async function loadItem(id) {
  if (!id) return
  loading.value = true
  try {
    // const data = await miService.getItem(id)
    // form.nombre = data.nombre || ''
    // form.email = data.email || ''
    // form.cantidad = data.cantidad || 0
    // form.categoria = data.categoria || ''
    // form.descripcion = data.descripcion || ''
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando item', e)
  } finally {
    loading.value = false
  }
}

function validateField(fieldName) {
  const validationRules = {
    nombre: [
      (value) => validators.required(value, 'Nombre'),
      (value) => validators.minLength(value, 3, 'Nombre')
    ],
    email: [
      (value) => validators.email(value, 'Email')
    ],
    cantidad: [
      (value) => validators.required(value, 'Cantidad'),
      (value) => validators.minValue(value, 0, 'Cantidad')
    ],
    categoria: [
      (value) => validators.required(value, 'Categoría')
    ],
    descripcion: [
      (value) => validators.maxLength(value, 500, 'Descripción')
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
    nombre: [
      (value) => validators.required(value, 'Nombre'),
      (value) => validators.minLength(value, 3, 'Nombre')
    ],
    cantidad: [
      (value) => validators.required(value, 'Cantidad'),
      (value) => validators.minValue(value, 0, 'Cantidad')
    ],
    categoria: [
      (value) => validators.required(value, 'Categoría')
    ]
  }

  if (!validateFormUtil(form, validationRules)) {
    return
  }

  try {
    loading.value = true
    const payload = {
      nombre: form.nombre,
      email: form.email || null,
      cantidad: form.cantidad,
      categoria: form.categoria,
      descripcion: form.descripcion || null
    }

    /*
    if (props.editId) {
      await miService.updateItem(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await miService.createItem(payload)
      emit('saved', { action: 'created' })
    }
    */

    setTimeout(() => {
      close()
    }, 100)
  } catch (e) {
    console.error('Error guardando item', e)
    alert(`Error al guardar: ${e.message}`)
  } finally {
    loading.value = false
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
  font-family: inherit;
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

.form-field textarea {
  resize: vertical;
  min-height: 80px;
}

.required {
  color: #f87171;
  font-weight: bold;
}

.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.btn-primary, .btn-secondary {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 111, 143, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
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

  .modal-header h2 {
    font-size: 18px;
  }
}
</style>
