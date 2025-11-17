<template>
  <div class="registro-container">
    <div class="registro-card">
      <div class="registro-header">
        <h1>Sistema Innoquim</h1>
        <p>Crear nueva cuenta</p>
      </div>

      <form @submit.prevent="submit" class="registro-form">
        <div class="form-row">
          <div class="form-group">
            <label for="username">Usuario *</label>
            <input 
              id="username"
              v-model="formData.username" 
              type="text" 
              required 
              placeholder="Nombre de usuario"
              :disabled="loading"
            />
            <span v-if="errors.username" class="field-error">{{ errors.username }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input 
              id="email"
              v-model="formData.email" 
              type="email" 
              required 
              placeholder="correo@ejemplo.com"
              :disabled="loading"
            />
            <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="first_name">Nombre *</label>
            <input 
              id="first_name"
              v-model="formData.first_name" 
              type="text" 
              required 
              placeholder="Tu nombre"
              :disabled="loading"
            />
            <span v-if="errors.first_name" class="field-error">{{ errors.first_name }}</span>
          </div>

          <div class="form-group">
            <label for="last_name">Apellido *</label>
            <input 
              id="last_name"
              v-model="formData.last_name" 
              type="text" 
              required 
              placeholder="Tu apellido"
              :disabled="loading"
            />
            <span v-if="errors.last_name" class="field-error">{{ errors.last_name }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">Contraseña *</label>
            <input 
              id="password"
              v-model="formData.password" 
              type="password" 
              required 
              minlength="8"
              placeholder="Mínimo 8 caracteres"
              :disabled="loading"
            />
            <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="password2">Confirmar Contraseña *</label>
            <input 
              id="password2"
              v-model="formData.password2" 
              type="password" 
              required 
              minlength="8"
              placeholder="Repetir contraseña"
              :disabled="loading"
            />
            <span v-if="errors.password2" class="field-error">{{ errors.password2 }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </div>

        <div v-if="error" class="alert alert-error">
          <strong>Error:</strong> {{ error }}
        </div>

        <div v-if="success" class="alert alert-success">
          <strong>¡Éxito!</strong> Tu cuenta ha sido creada. Redirigiendo...
        </div>

        <div class="registro-footer">
          <p>¿Ya tienes cuenta? <router-link to="/login">Iniciar sesión</router-link></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import authService from '../services/auth'
import { handleApiError, formatValidationErrors } from '../utils/errorHandler'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref(false)
const errors = reactive({})

const formData = reactive({
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  password2: '',
})

function clearErrors() {
  error.value = ''
  success.value = false
  Object.keys(errors).forEach(key => delete errors[key])
}

function validateForm() {
  clearErrors()
  let isValid = true

  // Validar que las contraseñas coincidan
  if (formData.password !== formData.password2) {
    errors.password2 = 'Las contraseñas no coinciden'
    isValid = false
  }

  // Validar longitud de contraseña
  if (formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
    isValid = false
  }

  return isValid
}

async function submit() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  
  try {
    // Preparar datos para enviar (sin password2)
    const { password2, ...userData } = formData
    
    // Llamar al servicio de registro
    await authService.register(userData)
    
    // Mostrar mensaje de éxito
    success.value = true
    
    // Notificar cambios de autenticación
    window.dispatchEvent(new Event('auth-change'))
    
    // Redirigir al dashboard después de 1 segundo
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (e) {
    console.error('Error en registro:', e)
    
    const errorInfo = handleApiError(e)
    
    // Si hay errores de validación, mostrarlos por campo
    if (errorInfo.type === 'validation' && errorInfo.errors) {
      const fieldErrors = formatValidationErrors(errorInfo.errors)
      Object.assign(errors, fieldErrors)
      error.value = 'Por favor, corrige los errores en el formulario'
    } else {
      error.value = errorInfo.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registro-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.registro-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.registro-header {
  text-align: center;
  margin-bottom: 30px;
}

.registro-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.registro-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.registro-form {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.field-error {
  color: #c00;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  margin-top: 24px;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  margin-top: 20px;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c00;
}

.alert-success {
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  color: #2e7d32;
}

.registro-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.registro-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.registro-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .registro-card {
    padding: 24px;
  }
}
</style>
