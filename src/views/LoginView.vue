<template>
  <div class="login-container">
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

        <div v-if="error" class="alert alert-error">
          <strong>Error:</strong> {{ error }}
        </div>

        <div class="login-footer">
          <p>¿No tienes cuenta? <router-link to="/registro">Registrarse</router-link></p>
        </div>
      </form>

      <div class="demo-credentials">
        <p><small>Credenciales de prueba:</small></p>
        <p><small><strong>Usuario:</strong> admin | <strong>Contraseña:</strong> admin123</small></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authService from '../services/auth'
import { handleApiError } from '../utils/errorHandler'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  
  try {
    // Llamar al servicio de autenticación con username y password
    await authService.login(username.value, password.value)
    
    // Notificar cambios de autenticación a otros componentes
    window.dispatchEvent(new Event('auth-change'))
    
    // Redirigir al dashboard o a la ruta solicitada
    const redirect = route.query?.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    // Manejar errores con el handler centralizado
    const errorInfo = handleApiError(e)
    error.value = errorInfo.message
    
    console.error('Error en login:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
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

.form-actions {
  margin-top: 24px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
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

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-footer a:hover {
  text-decoration: underline;
}

.demo-credentials {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
}

.demo-credentials p {
  margin: 5px 0;
}
</style>
