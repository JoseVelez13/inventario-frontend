<template>
  <header class="header-global">
    <!-- Botón para abrir sidebar -->
    <button class="sidebar-toggle" @click="toggleSidebar" aria-label="Abrir menú">
      <i class="fa-solid fa-bars"></i>
    </button>

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

  <!-- SIDEBAR -->
  <transition name="sidebar-fade">
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar">
      <aside class="sidebar" @click.stop>
        <div class="sidebar-header">
          <div class="sidebar-title">
            <i class="fa-solid fa-cube"></i>
            <span>Módulos del Sistema</span>
          </div>
          <button class="sidebar-close" @click="closeSidebar" aria-label="Cerrar menú">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">Principal</div>
            <router-link to="/" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-house"></i>
              <span>Inicio</span>
            </router-link>
            <router-link to="/dashboard" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-chart-line"></i>
              <span>Dashboard</span>
            </router-link>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Gestión</div>
            <router-link to="/productos" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-box"></i>
              <span>Productos</span>
            </router-link>
            <router-link to="/clientes" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-users"></i>
              <span>Clientes</span>
            </router-link>
            <router-link to="/materias-primas" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-flask"></i>
              <span>Materias Primas</span>
            </router-link>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Sistema</div>
            <button class="sidebar-item" @click="logout">
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </nav>
      </aside>
    </div>
  </transition>
</template>
<script>
import '../assets/styles/HeaderGlobal.css'
import logo from '../assets/img/logo.png'

export default {
  name: 'HeaderComponent',
  data() {
    return {
      logo,
      sidebarOpen: false
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    logout() {
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      } catch (e) {}
      this.closeSidebar()
      this.$router.push('/login')
    }
  }
}
</script>