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
      <NotificationBell />
      
      <DarkModeToggle />
      
      <button class="nav-item" @click="$router.push('/')">
        <i class="fa-solid fa-house"></i> Inicio
      </button>

      <button class="nav-item" @click="$router.push('/perfil')">
        <i class="fa-solid fa-user-circle"></i> Perfil
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
            <div class="nav-section-title">Catálogos</div>
            <router-link to="/proveedores" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-truck"></i>
              <span>Proveedores</span>
            </router-link>
            <router-link to="/almacenes" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-warehouse"></i>
              <span>Almacenes</span>
            </router-link>
            <router-link to="/unidades" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-ruler"></i>
              <span>Unidades</span>
            </router-link>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Inventario</div>
            <router-link to="/kardex" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-chart-simple"></i>
              <span>Kardex</span>
            </router-link>
            <router-link to="/recepciones" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-dolly"></i>
              <span>Recepciones Material</span>
            </router-link>
            <router-link to="/recepciones-productos" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-boxes-stacked"></i>
              <span>Recepciones Productos</span>
            </router-link>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Reportes</div>
            <router-link to="/archivos-drive" class="sidebar-item" @click="closeSidebar">
              <i class="fa-brands fa-google-drive"></i>
              <span>Archivos en Drive</span>
            <div class="nav-section-title">Producción</div>
            <router-link to="/lotes-produccion" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-industry"></i>
              <span>Lotes de Producción</span>
            </router-link>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Ventas</div>
            <router-link to="/ordenes-cliente" class="sidebar-item" @click="closeSidebar">
              <i class="fa-solid fa-shopping-cart"></i>
              <span>Órdenes de Cliente</span>
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
import NotificationBell from './NotificationBell.vue'
import DarkModeToggle from './DarkModeToggle.vue'

export default {
  name: 'HeaderComponent',
  components: { NotificationBell, DarkModeToggle },
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
      } catch (e) { }
      this.closeSidebar()
      this.$router.push('/login')
    }
  }
}
</script>