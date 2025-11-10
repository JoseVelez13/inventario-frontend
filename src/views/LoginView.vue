<template>
  <div class="login-container">
    <h1>Iniciar sesión</h1>

    <form @submit.prevent="submit" class="login-form">
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>

      <label>
        Contraseña
        <input v-model="password" type="password" required minlength="4" />
      </label>

      <div class="actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Entrando...' : 'Entrar' }}</button>
      </div>

      <p class="error" v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import auth from '../services/auth'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    // Notify other components about auth change
    window.dispatchEvent(new Event('auth-change'))
    const redirect = route.query?.redirect || '/dashboard'
    router.push(redirect)
  } catch (e) {
    // Try to show backend message if available
    error.value = e?.response?.data?.detail || e?.response?.data?.message || 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container { max-width: 420px; margin: 40px auto; padding: 12px; }
.login-form label { display:block; margin-bottom:10px }
.login-form input { width:100%; padding:8px; box-sizing:border-box }
.actions { margin-top:12px }
.error { color: #c00; margin-top:8px }
</style>
