import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '../views/InicioView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import DashboardView from '../views/DashboardView.vue'
import authService from '../services/auth'

const routes = [
  { 
    path: '/', 
    name: 'Inicio',
    component: InicioView,
    meta: { title: 'Inicio - Sistema Innoquim' }
  },
  { 
    path: '/login', 
    name: 'Login',
    component: LoginView,
    meta: { 
      title: 'Iniciar Sesión - Sistema Innoquim',
      hideForAuth: true // Ocultar si ya está autenticado
    }
  },
  { 
    path: '/registro', 
    name: 'Registro',
    component: RegistroView,
    meta: { 
      title: 'Registro - Sistema Innoquim',
      hideForAuth: true // Ocultar si ya está autenticado
    }
  },
  { 
    path: '/dashboard', 
    name: 'Dashboard',
    component: DashboardView, 
    meta: { 
      requiresAuth: true,
      title: 'Dashboard - Sistema Innoquim'
    } 
  },
  // ruta fallback para errores (si alguien entra a /xd123)
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global para proteger rutas que requieren autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  
  // Actualizar título de la página
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // Si la ruta requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
    return
  }
  
  // Si está autenticado e intenta ir a login/registro, redirigir a dashboard
  if (to.meta.hideForAuth && isAuthenticated) {
    next({ path: '/dashboard' })
    return
  }
  
  next()
})

export default router
