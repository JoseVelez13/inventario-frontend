<template>
    <div>
        <!-- Botón hamburguesa -->
        <transition name="fade">
            <button v-if="!sidebarOpen" class="hamburger-btn" @click="openSidebar" type="button" id="hamburgerBtn">
                <i class="bi bi-list"></i>
            </button>
        </transition>

        <!-- Sidebar -->
        <SideBar ref="sidebar" @sidebar-opening="sidebarOpen = true" @sidebar-opened="sidebarOpen = true"
            @sidebar-closed="sidebarOpen = false" />

        <!-- Contenido principal -->
        <div class="container-fluid">
            <div class="row">
                <div class="col min-vh-100 py-3">
                    <router-view />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SideBar from './SideBar.vue'
import { Offcanvas } from 'bootstrap'

export default {
    name: 'MainLayout',
    components: {
        SideBar
    },
    data() {
        return {
            sidebarOpen: false
        }
    },
    methods: {
        openSidebar() {
            this.sidebarOpen = true

            // Abrir el sidebar usando Bootstrap
            this.$nextTick(() => {
                const offcanvasElement = document.getElementById('offcanvas')
                if (offcanvasElement) {
                    const offcanvasInstance = Offcanvas.getInstance(offcanvasElement) || new Offcanvas(offcanvasElement)
                    offcanvasInstance.show()
                }
            })
        }
    }
}
</script>

<style scoped>
.hamburger-btn {
    position: fixed;
    top: 80px;
    left: 20px;
    z-index: 1060;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #495057;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10px);
}

.hamburger-btn:hover {
    background-color: rgba(255, 255, 255, 1);
    color: #212529;
}

.hamburger-btn i {
    font-size: 24px;
}

/* Transición suave para el botón */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>