<template>
  <div class="login-page">
    <div class="login-bg"></div>

    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <h1>Sistema Innoquim</h1>
          <p>Iniciar sesión</p>
        </div>

        <form @submit.prevent="submit" class="login-form">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input 
            id="username"
            v-model="username" 
            type="text" 
            required 
            placeholder="Ingresa tu usuario"
            :disabled="loading"
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
            placeholder="Ingresa tu contraseña"
            :disabled="loading"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </div>

        </form>

        <div class="demo-credentials">
          <p><small>Credenciales de prueba:</small></p>
          <p><small><strong>Usuario:</strong> admin | <strong>Contraseña:</strong> admin123</small></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import '../assets/styles/Login.css'

// Sin validaciones de credenciales contra backend; se usan credenciales de prueba
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true

  // Credenciales de prueba
  const isValid = username.value === 'admin' && password.value === 'admin123'
  if (isValid) {
    // Mock de autenticación: almacenar tokens y usuario para que el guard permita el acceso
    localStorage.setItem('access_token', 'demo-token')
    localStorage.setItem('refresh_token', 'demo-refresh')
    localStorage.setItem('user', JSON.stringify({ username: 'admin', email: 'admin@innoquim.com' }))

    window.dispatchEvent(new Event('auth-change'))

    // Si hay redirect en query y es string, úsalo; si no, ir por nombre de ruta
    const redirect = route.query && route.query.redirect ? route.query.redirect : null
    if (redirect && typeof redirect === 'string') {
      router.push(redirect)
    } else {
      router.push({ name: 'Dashboard' })
    }
  } else {
    alert('Credenciales inválidas de prueba. Use admin / admin123')
  }

  loading.value = false
}
</script>

<!-- Estilos movidos a src/assets/styles/Login.css -->
<style scoped></style>
