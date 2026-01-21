<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="ruc">RUC <span class="required">*</span></label>
                <input 
                  id="ruc" 
                  v-model="form.ruc" 
                  maxlength="13" 
                  minlength="13" 
                  inputmode="numeric" 
                  placeholder="Ej: 1234567890001"
                  @blur="validateField('ruc')"
                  :class="{ 'input-error': errors.ruc }"
                />
                <FormErrorMessage :error="errors.ruc" />
              </div>

              <div class="form-field">
                <label for="nombre_empresa">Nombre de la Empresa <span class="required">*</span></label>
                <input 
                  id="nombre_empresa" 
                  v-model="form.nombre_empresa" 
                  maxlength="100"
                  placeholder="Nombre de la empresa"
                  @blur="validateField('nombre_empresa')"
                  :class="{ 'input-error': errors.nombre_empresa }"
                />
                <FormErrorMessage :error="errors.nombre_empresa" />
              </div>

              <div class="form-field">
                <label for="nombre_contacto">Nombre del Contacto <span class="required">*</span></label>
                <input 
                  id="nombre_contacto" 
                  v-model="form.nombre_contacto" 
                  maxlength="100"
                  placeholder="Nombre del contacto"
                  @blur="validateField('nombre_contacto')"
                  :class="{ 'input-error': errors.nombre_contacto }"
                />
                <FormErrorMessage :error="errors.nombre_contacto" />
              </div>

              <div class="form-field">
                <label for="telefono">Teléfono <span class="required">*</span></label>
                <input 
                  id="telefono" 
                  v-model="form.telefono" 
                  maxlength="24" 
                  inputmode="tel"
                  placeholder="Ej: +51 999 999 999"
                  @blur="validateField('telefono')"
                  :class="{ 'input-error': errors.telefono }"
                />
                <FormErrorMessage :error="errors.telefono" />
              </div>

              <div class="form-field full">
                <label for="email">Correo Electrónico <span class="required">*</span></label>
                <input 
                  id="email" 
                  type="email" 
                  v-model="form.email" 
                  maxlength="100"
                  placeholder="correo@empresa.com"
                  @blur="validateField('email')"
                  :class="{ 'input-error': errors.email }"
                />
                <FormErrorMessage :error="errors.email" />
              </div>

              <div class="form-field full">
                <label for="direccion">Dirección <span class="required">*</span></label>
                <textarea 
                  id="direccion" 
                  v-model="form.direccion"
                  placeholder="Dirección completa"
                  @blur="validateField('direccion')"
                  :class="{ 'input-error': errors.direccion }"
                ></textarea>
                <FormErrorMessage :error="errors.direccion" />
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
import { ref, watch, reactive } from 'vue'
import clientesService from '../services/clientesService'
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
const { errors, validators, validateField: validateFieldUtil, validateForm: validateFormUtil } = useFormValidation()

const form = reactive({
  ruc: '',
  nombre_empresa: '',
  nombre_contacto: '',
  telefono: '',
  email: '',
  direccion: ''
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.editId, (id) => { if (id) loadCliente(id) })

function resetForm() {
  form.ruc = ''
  form.nombre_empresa = ''
  form.nombre_contacto = ''
  form.telefono = ''
  form.email = ''
  form.direccion = ''
}

async function loadCliente(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await clientesService.getCliente(id)
    form.ruc = data.ruc || ''
    form.nombre_empresa = data.nombre_empresa || ''
    form.nombre_contacto = data.nombre_contacto || ''
    form.telefono = data.telefono || ''
    form.email = data.email || ''
    form.direccion = data.direccion || ''
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando cliente para editar', e)
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  isEdit.value = false
  resetForm()
  emit('close')
}

function validateField(fieldName) {
  const validationRules = {
    ruc: [
      (value) => validators.required(value, 'RUC'),
      (value) => validators.ruc(value, 'RUC')
    ],
    nombre_empresa: [
      (value) => validators.required(value, 'Nombre de la empresa'),
      (value) => validators.minLength(value, 3, 'Nombre de la empresa')
    ],
    nombre_contacto: [
      (value) => validators.required(value, 'Nombre del contacto'),
      (value) => validators.minLength(value, 3, 'Nombre del contacto')
    ],
    telefono: [
      (value) => validators.required(value, 'Teléfono'),
      (value) => validators.phone(value, 'Teléfono')
    ],
    email: [
      (value) => validators.required(value, 'Correo electrónico'),
      (value) => validators.email(value, 'Correo electrónico')
    ],
    direccion: [
      (value) => validators.required(value, 'Dirección'),
      (value) => validators.minLength(value, 10, 'Dirección')
    ]
  }

  if (validationRules[fieldName]) {
    validateFieldUtil(fieldName, form[fieldName], validationRules[fieldName])
  }
}

async function submit() {
  const validationRules = {
    ruc: [
      (value) => validators.required(value, 'RUC'),
      (value) => validators.ruc(value, 'RUC')
    ],
    nombre_empresa: [
      (value) => validators.required(value, 'Nombre de la empresa'),
      (value) => validators.minLength(value, 3, 'Nombre de la empresa')
    ],
    nombre_contacto: [
      (value) => validators.required(value, 'Nombre del contacto'),
      (value) => validators.minLength(value, 3, 'Nombre del contacto')
    ],
    telefono: [
      (value) => validators.required(value, 'Teléfono'),
      (value) => validators.phone(value, 'Teléfono')
    ],
    email: [
      (value) => validators.required(value, 'Correo electrónico'),
      (value) => validators.email(value, 'Correo electrónico')
    ],
    direccion: [
      (value) => validators.required(value, 'Dirección'),
      (value) => validators.minLength(value, 10, 'Dirección')
    ]
  }

  if (!validateFormUtil(form, validationRules)) {
    return
  }

  try {
    loading.value = true
    const payload = {
      ruc: form.ruc,
      nombre_empresa: form.nombre_empresa,
      nombre_contacto: form.nombre_contacto,
      telefono: form.telefono,
      email: form.email,
      direccion: form.direccion
    }

    if (props.editId) {
      await clientesService.updateCliente(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await clientesService.createCliente(payload)
      emit('saved', { action: 'created' })
    }

    close()
  } catch (e) {
    console.error('Error guardando cliente', e)
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
