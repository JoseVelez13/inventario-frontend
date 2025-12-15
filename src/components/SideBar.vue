<template>
  <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvas" aria-labelledby="offcanvasLabel"
    ref="offcanvasElement">
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title" id="offcanvasLabel">
        <i class="bi bi-menu-button-wide me-2"></i>Menú
      </h5>
      <button type="button" class="btn-close" @click="forceClose" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body p-0">
      <ul class="nav nav-pills flex-column">
        <li class="nav-item">
          <a href="#" class="nav-link rounded-0" :class="{ 'active': $route.path === '/dashboard' }"
            @click.prevent="navigateTo('/dashboard')">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link rounded-0" :class="{ 'active': $route.path === '/clientes' }"
            @click.prevent="navigateTo('/clientes')">
            <i class="bi bi-people me-2"></i>Clientes
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link rounded-0" :class="{ 'active': $route.path === '/productos' }"
            @click.prevent="navigateTo('/productos')">
            <i class="bi bi-box-seam me-2"></i>Productos
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link rounded-0" :class="{ 'active': $route.path === '/materias-primas' }"
            @click.prevent="navigateTo('/materias-primas')">
            <i class="bi bi-layers me-2"></i>Materias Primas
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Offcanvas } from 'bootstrap'

export default {
  name: 'SideBar',
  data() {
    return {
      bsOffcanvas: null,
      isClosing: false
    }
  },
  mounted() {
    const offcanvasElement = this.$refs.offcanvasElement

    // Inicializar offcanvas con backdrop estático
    this.bsOffcanvas = new Offcanvas(offcanvasElement, {
      backdrop: 'static',  // No se cierra al hacer clic fuera
      keyboard: false      // No se cierra con ESC
    })

    // Eventos
    offcanvasElement.addEventListener('show.bs.offcanvas', this.handleShow)
    offcanvasElement.addEventListener('shown.bs.offcanvas', this.handleShown)
    offcanvasElement.addEventListener('hide.bs.offcanvas', this.handleHide)
    offcanvasElement.addEventListener('hidden.bs.offcanvas', this.handleHidden)
  },
  methods: {
    handleShow() {
      this.$emit('sidebar-opening')
    },
    handleShown() {
      this.$emit('sidebar-opened')
    },
    handleHide() {
      // Marcar que está cerrando
      this.isClosing = true
    },
    handleHidden() {
      // Limpiar todo cuando se cierra completamente
      this.cleanUp()
      this.$emit('sidebar-closed')

      // Resetear flag después de un momento
      setTimeout(() => {
        this.isClosing = false
      }, 200)
    },
    navigateTo(path) {
      // Solo navegar si no está ya cerrando
      if (this.isClosing) return

      // Marcar que está cerrando
      this.isClosing = true

      // Navegar
      if (this.$route.path !== path) {
        this.$router.push(path)
      }

      // Cerrar el sidebar
      if (this.bsOffcanvas) {
        this.bsOffcanvas.hide()
      }
    },
    forceClose() {
      // Cerrar manualmente con el botón X
      if (this.isClosing) return

      this.isClosing = true
      if (this.bsOffcanvas) {
        this.bsOffcanvas.hide()
      }
    },
    cleanUp() {
      // Eliminar backdrop y limpiar estilos
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.offcanvas-backdrop, .modal-backdrop')
        backdrops.forEach(backdrop => backdrop.remove())

        document.body.classList.remove('modal-open', 'offcanvas-open')
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }, 50)
    }
  },
  beforeUnmount() {
    const offcanvasElement = this.$refs.offcanvasElement

    // Remover event listeners
    offcanvasElement.removeEventListener('show.bs.offcanvas', this.handleShow)
    offcanvasElement.removeEventListener('shown.bs.offcanvas', this.handleShown)
    offcanvasElement.removeEventListener('hide.bs.offcanvas', this.handleHide)
    offcanvasElement.removeEventListener('hidden.bs.offcanvas', this.handleHidden)

    // Destruir instancia
    if (this.bsOffcanvas) {
      this.bsOffcanvas.dispose()
    }

    this.cleanUp()
  }
}
</script>

<style scoped>
.offcanvas {
  width: 280px !important;
}

.nav-link {
  color: #495057;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  cursor: pointer;
  text-decoration: none;
  display: block;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #0d6efd;
  border-left-color: #0d6efd;
}

.nav-link.active {
  background-color: #e7f1ff;
  color: #0d6efd;
  border-left-color: #0d6efd;
  font-weight: 500;
}

.offcanvas-header {
  background-color: #f8f9fa;
}
</style>