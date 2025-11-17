<template>
  <header class="header">
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

      <button class="nav-item" @click="$router.push('/login')">
        <i class="fa-solid fa-right-to-bracket"></i> Login
      </button>

      <button class="nav-item" @click="$router.push('/registro')">
        <i class="fa-solid fa-user-plus"></i> Registro
      </button>

      <button class="nav-item" @click="$router.push('/dashboard')">
        <i class="fa-solid fa-table"></i> Dashboard
      </button>
    </nav>
  </header>
</template>
<script>
import '../assets/styles/Header.css'
import logo from '../assets/img/logo.png'

export default {
  name: 'HeaderComponent',
  data() {
    return {
      logo
    }
  }
}
</script>