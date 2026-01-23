<template>
  <div class="auth-callback">
    <div v-if="loading" class="loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Procesando autenticación...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <i class="fa-solid fa-circle-exclamation"></i>
      <h2>Error de autenticación</h2>
      <p>{{ error }}</p>
      <button @click="closeWindow">Cerrar ventana</button>
    </div>
    
    <div v-else-if="success" class="success">
      <i class="fa-solid fa-circle-check"></i>
      <h2>Autenticación exitosa</h2>
      <p>Ya puedes cerrar esta ventana y volver a intentar guardar el archivo.</p>
      <button @click="closeWindow">Cerrar ventana</button>
    </div>
  </div>
</template>

<script>
import fileManagerService from '@/services/fileManagerService'

export default {
  name: 'AuthCallback',
  data() {
    return {
      loading: true,
      error: null,
      success: false
    }
  },
  async mounted() {
    await this.handleCallback()
  },
  methods: {
    async handleCallback() {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        const error = urlParams.get('error')
        
        if (error) {
          this.error = `Error de Google: ${error}`
          this.loading = false
          return
        }
        
        if (!code || !state) {
          this.error = 'Faltan parámetros de autenticación'
          this.loading = false
          return
        }
        
        // Procesar el callback
        await fileManagerService.handleAuthCallback(code, state)
        
        // Notificar a la ventana padre que la autenticación fue exitosa
        if (window.opener) {
          window.opener.postMessage({
            type: 'auth_success',
            code: code,
            state: state
          }, '*')
        }
        
        this.success = true
        this.loading = false
        
        // Cerrar automáticamente después de 2 segundos
        setTimeout(() => {
          this.closeWindow()
        }, 2000)
        
      } catch (error) {
        console.error('Error en callback:', error)
        this.error = error.message || 'Error al procesar la autenticación'
        this.loading = false
      }
    },
    
    closeWindow() {
      if (window.opener) {
        window.close()
      } else {
        // Si no hay ventana padre, redirigir al inicio
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.auth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.loading, .error, .success {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.loading i, .error i, .success i {
  font-size: 48px;
  margin-bottom: 20px;
}

.loading i {
  color: #3b82f6;
}

.error i {
  color: #ef4444;
}

.success i {
  color: #10b981;
}

h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
}

p {
  margin: 0 0 24px 0;
  color: #6b7280;
  line-height: 1.5;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background: #2563eb;
}

.error button {
  background: #ef4444;
}

.error button:hover {
  background: #dc2626;
}

.success button {
  background: #10b981;
}

.success button:hover {
  background: #059669;
}
</style>