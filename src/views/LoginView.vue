<template>
  <div class="login-page">
    <!-- Lado izquierdo - Branding -->
    <div class="login-brand">
      <div class="brand-content">
        <img :src="logo" alt="Logo Innoquim" class="brand-logo" />
        <h1 class="brand-title">INNOQUIM</h1>
        <p class="brand-subtitle">Sistema de Gestión de Inventario</p>
        <div class="brand-features">
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Control de inventario en tiempo real</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Gestión integral de clientes</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Reportes y análisis detallados</span>
          </div>
          <div class="brand-feature">
            <span class="feature-icon">✓</span>
            <span>Gestión de Proveedores</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lado derecho - Formulario -->
    <div class="login-form-section">
      <div class="login-card">
        <div class="login-header">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>
        
        <!-- Mostrar errores -->
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>
        
        <form @submit.prevent="submit" class="login-form">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              required 
              autocomplete="email"
              :disabled="loading"
              :class="{ 'has-error': error && !email }"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              v-model="password" 
              type="password" 
              required 
              minlength="4"
              autocomplete="current-password" 
              :disabled="loading"
              :class="{ 'has-error': error && !password }"
            />
          </div>
          
          <div class="form-actions">
            <button 
              type="submit" 
              :disabled="loading" 
              class="btn-primary"
              :class="{ 'is-loading': loading }"
            >
              <span v-if="!loading">Iniciar sesión</span>
              <span v-else class="loading-text">
                <span class="spinner"></span>
                Iniciando sesión...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import authService from '../services/auth'
import logo from '../assets/img/logo.png'
import '../assets/styles/Login.css'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  
  try {
    await authService.login(email.value, password.value)
    
    // Emitir evento de cambio de autenticación
    window.dispatchEvent(new Event('auth-change'))
    
    // Mostrar notificación de éxito
    toast.success('¡Inicio de sesión exitoso!', {
      timeout: 2000
    })
    
    // Redirigir al dashboard o a la página de origen
    const redirect = route.query?.redirect
    if (redirect && typeof redirect === 'string') {
      router.push(redirect)
    } else {
      router.push({ name: 'Dashboard' })
    }
  } catch (err) {
    console.error('Error en login:', err)
    
    // Manejar diferentes tipos de errores
    if (err.response) {
      // El servidor respondió con un código de error
      if (err.response.status === 401) {
        error.value = 'Usuario o contraseña incorrectos'
        toast.error('Usuario o contraseña incorrectos')
      } else if (err.response.data?.detail) {
        error.value = err.response.data.detail
        toast.error(err.response.data.detail)
      } else {
        error.value = 'Error al iniciar sesión. Intenta nuevamente.'
        toast.error('Error al iniciar sesión. Intenta nuevamente.')
      }
    } else if (err.request) {
      // La petición se hizo pero no hubo respuesta
      error.value = 'No se pudo conectar con el servidor. Verifica tu conexión.'
      toast.error('No se pudo conectar con el servidor')
    } else {
      // Algo pasó al configurar la petición
      error.value = 'Error inesperado. Intenta nuevamente.'
      toast.error('Error inesperado. Intenta nuevamente.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<!-- Estilos movidos a src/assets/styles/Login.css -->
<style scoped></style>
