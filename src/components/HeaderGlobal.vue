<template>
  <header class="header-global">
    <!-- Contenedor principal -->
    <div class="left-section">
      <img :src="logo" alt="Logo empresa" class="logo" />

      <div class="system-info">
        <h1 class="title">INNOQUIM</h1>
        <h2 class="subtitle">Sistema de Gestión de Inventario</h2>
      </div>
    </div>

    <!-- MENÚ SUPERIOR -->
    <nav class="nav-menu">
      <button class="nav-item" @click="$router.push('/')">
        <i class="fa-solid fa-house"></i> Inicio
      </button>

      <button class="nav-item" @click="$router.push('/dashboard')">
        <i class="fa-solid fa-table"></i> Dashboard
      </button>

      <button class="nav-item" @click="logout">
        <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión
      </button>
    </nav>
  </header>
</template>
<script>
import '../assets/styles/HeaderGlobal.css'
import logo from '../assets/img/logo.png'

export default {
  name: 'HeaderComponent',
  data() {
    return {
      logo
    }
  },
  methods: {
    logout() {
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      } catch (e) {}
      this.$router.push('/login')
    }
  }
}
</script>