<template>
  <div class="profile-page">
    <HeaderGlobal />
    
    <div class="profile-container">
      <div class="profile-header">
        <div class="header-top">
          <button class="back-btn" @click="$router.push('/dashboard')">
            <i class="fa-solid fa-arrow-left"></i> Volver al Inicio
          </button>
        </div>
        <h1 class="profile-title">Mi Perfil</h1>
        <p class="profile-subtitle">Gestiona tu información personal y seguridad de la cuenta</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando información...</p>
      </div>

      <div v-else class="profile-content">
        <!-- Left Column: Summary Card -->
        <div class="profile-card">
          <div class="profile-avatar-wrapper">
            <div class="profile-avatar-placeholder">
              {{ userInitials }}
            </div>
          </div>

          <h2 class="profile-name">{{ form.name }}</h2>
          <span class="profile-role">{{ userRole }}</span>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-label">Usuario desde</span>
              <span class="stat-value">{{ formatDate(user.created_at) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Estado</span>
              <span class="stat-value">
                <i class="fa-solid fa-circle" style="color: #10B981; font-size: 10px; margin-right: 4px;"></i>
                Activo
              </span>
            </div>
          </div>
        </div>

        <!-- Right Column: Edit Form -->
        <div class="settings-card">
          <div class="settings-header">
            <h3 class="settings-title">
              <i class="fa-regular fa-id-card"></i>
              Información Personal
            </h3>
          </div>

          <div class="settings-body">
            <form @submit.prevent="saveProfile">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">Nombre Completo</label>
                  <input 
                    v-model="form.name" 
                    type="text" 
                    class="form-input" 
                    placeholder="Tu nombre completo"
                    required
                  />
                </div>

                <div class="form-group full-width">
                  <label class="form-label">Correo Electrónico</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="form-input" 
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>

                <div class="form-group full-width">
                  <label class="form-label">Nombre de Usuario (Login)</label>
                  <input 
                    v-model="user.username" 
                    type="text" 
                    class="form-input" 
                    
                    title="El nombre de usuario no se puede cambiar"
                  />
                </div>
              </div>

              <!-- Sección de Cambio de Contraseña -->
              <div class="password-section">
                <h4 class="section-subtitle">
                  <i class="fa-solid fa-lock"></i> Cambiar Contraseña
                </h4>
                <p class="section-desc">Deja estos campos vacíos si no deseas cambiar tu contraseña.</p>
                
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Nueva Contraseña</label>
                    <input 
                      v-model="form.password" 
                      type="password" 
                      class="form-input" 
                      placeholder="Nueva contraseña"
                      minlength="8"
                    />
                  </div>
                  
                  <div class="form-group">
                    <label class="form-label">Confirmar Contraseña</label>
                    <input 
                      v-model="form.confirmPassword" 
                      type="password" 
                      class="form-input" 
                      placeholder="Confirmar nueva contraseña"
                    />
                  </div>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="resetForm">
                  Cancelar
                </button>
                <button type="submit" class="btn-primary" :disabled="saving">
                  <i v-if="saving" class="fa-solid fa-circle-notch fa-spin"></i>
                  <i v-else class="fa-solid fa-save"></i>
                  {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import HeaderGlobal from '../components/HeaderGlobal.vue'
import authService from '../services/auth'
import usuariosService from '../services/usuariosService'
import '../assets/styles/Profile.css'

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const user = ref({})

// Form state
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Computeds
const userInitials = computed(() => {
  if (!form.value.name) return 'U'
  const names = form.value.name.split(' ')
  if (names.length >= 2) {
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase()
  }
  return form.value.name.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  const roles = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'employee': 'Empleado',
    'client': 'Cliente'
  }
  return roles[user.value.rol] || user.value.rol || 'Usuario'
})

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'Reciente'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadUserData = async () => {
  try {
    loading.value = true
    
    // Obtener usuario del localStorage primero para tener ID
    const localUser = authService.getUser()
    
    if (localUser && localUser.id) {
      try {
        // Intentar obtener datos frescos usando el ID directamente
        const userData = await usuariosService.getUsuario(localUser.id)
        user.value = userData
      } catch (err) {
        console.warn('No se pudo obtener usuario por ID, usando datos locales', err)
        user.value = localUser
      }
    } else {
      // Si no hay ID, intentar /usuarios/me/
      try {
        const userData = await usuariosService.getMe()
        user.value = userData
      } catch (err) {
        console.error('Error cargando usuario me', err)
        // Último recurso: usar lo que haya en localStorage aunque esté incompleto
        if (localUser) user.value = localUser
      }
    }

    // Inicializar formulario
    resetForm()

  } catch (error) {
    console.error('Error general cargando perfil:', error)
    toast.error('No se pudo cargar la información del perfil')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: user.value.name || '',
    email: user.value.email || '',
    password: '',
    confirmPassword: ''
  }
}

const saveProfile = async () => {
  // Validar contraseñas si se ingresaron
  if (form.value.password || form.value.confirmPassword) {
    if (form.value.password !== form.value.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (form.value.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
  }

  try {
    saving.value = true
    
    const updateData = {
      name: form.value.name,
      email: form.value.email
    }

    // Solo agregar password si se ingresó
    if (form.value.password) {
      updateData.password = form.value.password
    }

    // Llamar al servicio de actualización
    const updatedUser = await usuariosService.updateUsuario(user.value.id, updateData)
    
    // Actualizar estado local
    user.value = { ...user.value, ...updatedUser }
    
    // Actualizar localStorage
    localStorage.setItem('user', JSON.stringify(user.value))
    
    // Limpiar campos de contraseña
    form.value.password = ''
    form.value.confirmPassword = ''
    
    toast.success('Perfil actualizado correctamente')
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    if (error.response && error.response.data) {
      // Mostrar errores específicos del backend
      const errors = Object.values(error.response.data).flat()
      errors.forEach(err => toast.error(err))
    } else {
      toast.error('Error al guardar los cambios')
    }
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-page {
  background-color: var(--color-bg-alt, #f9fafb);
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--color-text-light);
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--color-primary);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.header-top {
  margin-bottom: 1rem;
}

.back-btn {
  background: transparent;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  padding: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--color-primary);
}

.password-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--color-border);
}

.section-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.25rem;
}

.section-desc {
  font-size: 13px;
  color: var(--color-text-light);
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
