<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="ruc">RUC *</label>
                <input 
                  id="ruc" 
                  v-model="form.ruc" 
                  required
                  maxlength="13" 
                  minlength="13" 
                  inputmode="numeric" 
                  pattern="[0-9]{13}"
                  placeholder="Ej: 1234567890001"
                  title="El RUC debe tener exactamente 13 dígitos numéricos"
                />
                <small style="color: #666; font-size: 0.85em; display: block; margin-top: 4px;">Debe tener 13 dígitos numéricos</small>
              </div>

              <div class="form-field">
                <label for="nombre_empresa">Nombre de la Empresa *</label>
                <input 
                  id="nombre_empresa" 
                  v-model="form.nombre_empresa" 
                  required
                  maxlength="100" 
                  placeholder="Ej: Distribuidora ABC"
                />
              </div>

              <div class="form-field">
                <label for="nombre_contacto">Nombre del Contacto</label>
                <input 
                  id="nombre_contacto" 
                  v-model="form.nombre_contacto" 
                  maxlength="100" 
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div class="form-field">
                <label for="telefono">Teléfono</label>
                <input 
                  id="telefono" 
                  v-model="form.telefono" 
                  maxlength="24" 
                  inputmode="tel" 
                  placeholder="Ej: 0987654321"
                />
              </div>

              <div class="form-field full">
                <label for="email">Correo Electrónico</label>
                <input 
                  id="email" 
                  type="text" 
                  v-model="form.email" 
                  maxlength="100" 
                  placeholder="contacto@empresa.com"
                />
                <small class="help-text">Se permiten letras con tildes y ñ</small>
              </div>

              <div class="form-field full">
                <label for="direccion">Dirección</label>
                <textarea 
                  id="direccion" 
                  v-model="form.direccion" 
                  rows="2"
                  placeholder="Av. Principal 123, Ciudad"
                ></textarea>
              </div>

              <div class="form-field full">
                <label for="tipo_producto">Tipo de Producto</label>
                <input 
                  id="tipo_producto" 
                  v-model="form.tipo_producto" 
                  maxlength="100" 
                  placeholder="Ej: Químicos, Materias Primas, Envases"
                />
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
import proveedoresService from '../services/proveedoresService'

const props = defineProps({
  visible: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved', 'error'])

const isEdit = ref(false)
const loading = ref(false)

const form = reactive({
  ruc: '',
  nombre_empresa: '',
  nombre_contacto: '',
  telefono: '',
  email: '',
  direccion: '',
  tipo_producto: ''
})

watch(() => props.editId, (id) => { 
  if (id) {
    loadProveedor(id)
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.ruc = ''
  form.nombre_empresa = ''
  form.nombre_contacto = ''
  form.telefono = ''
  form.email = ''
  form.direccion = ''
  form.tipo_producto = ''
  isEdit.value = false
}

async function loadProveedor(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await proveedoresService.getProveedor(id)
    form.ruc = data.ruc || ''
    form.nombre_empresa = data.nombre_empresa || ''
    form.nombre_contacto = data.nombre_contacto || ''
    form.telefono = data.telefono || ''
    form.email = data.email || ''
    form.direccion = data.direccion || ''
    form.tipo_producto = data.tipo_producto || ''
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando proveedor para editar', e)
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
      ruc: form.ruc,
      nombre_empresa: form.nombre_empresa,
      nombre_contacto: form.nombre_contacto || null,
      telefono: form.telefono || null,
      email: form.email || null,
      direccion: form.direccion || null,
      tipo_producto: form.tipo_producto || null
    }

    console.log('Enviando proveedor:', payload)

    if (props.editId) {
      await proveedoresService.updateProveedor(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      const response = await proveedoresService.createProveedor(payload)
      console.log('Respuesta del servidor:', response)
      emit('saved', { action: 'created' })
    }

    setTimeout(() => {
      close()
    }, 100)
  } catch (e) {
    console.error('Error guardando proveedor:', e)
    console.error('Detalles del error:', e.response?.data)
    
    // Procesar errores de validación del backend
    if (e.response?.data) {
      const errors = e.response.data
      let errorMsg = ''
      
      for (const [field, messages] of Object.entries(errors)) {
        const fieldName = field === 'ruc' ? 'RUC' : 
                         field === 'email' ? 'Correo Electrónico' : 
                         field === 'nombre_empresa' ? 'Nombre de Empresa' : 
                         field === 'telefono' ? 'Teléfono' :
                         field === 'nombre_contacto' ? 'Nombre de Contacto' : field
        
        if (Array.isArray(messages)) {
          messages.forEach(msg => {
            // Traducir mensajes comunes del backend
            let translatedMsg = msg
            if (msg.includes('already exists')) translatedMsg = 'ya está registrado'
            else if (msg.includes('Enter a valid email')) translatedMsg = 'Ingrese un correo electrónico válido'
            else if (msg.includes('This field may not be blank')) translatedMsg = 'Este campo es obligatorio'
            else if (msg.includes('This field is required')) translatedMsg = 'Este campo es requerido'
            else if (msg.includes('Ensure this field has no more than')) translatedMsg = 'Máximo de caracteres excedido'
            
            errorMsg += `${fieldName}: ${translatedMsg}. `
          })
        } else {
          let translatedMsg = messages
          if (messages.includes('already exists')) translatedMsg = 'ya está registrado'
          else if (messages.includes('Enter a valid email')) translatedMsg = 'Ingrese un correo electrónico válido'
          
          errorMsg += `${fieldName}: ${translatedMsg}. `
        }
      }
      
      console.log('🔴 Emitiendo evento error:', errorMsg || 'Error de validación')
      emit('error', errorMsg || 'Error de validación')
    } else {
      const msg = 'Error al guardar el proveedor. Por favor, verifique los datos e intente nuevamente.'
      console.log('🔴 Emitiendo evento error:', msg)
      emit('error', msg)
    }
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
  max-width: 600px;
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

.form-field input,
.form-field textarea {
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
