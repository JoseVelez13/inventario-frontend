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
import '../assets/styles/MainLayout.css'

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