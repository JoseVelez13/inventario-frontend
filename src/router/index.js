import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '../views/InicioView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ClientesListView from '../views/ClientesListView.vue'
import ClienteCreateView from '../views/ClienteCreateView.vue'
import ProductosListView from '../views/ProductosListView.vue'
import ProductoCreateView from '../views/ProductoCreateView.vue'
import MateriasPrimasListView from '../views/MateriasPrimasListView.vue'
import MateriaPrimaCreateView from '../views/MateriaPrimaCreateView.vue'
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
    path: '/dashboard', 
    name: 'Dashboard',
    component: DashboardView, 
    meta: { 
      requiresAuth: true,
      title: 'Dashboard - Sistema Innoquim'
    } 
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesListView,
    meta: { title: 'Clientes - Sistema Innoquim' }
  },
  {
    path: '/clientes/nuevo',
    name: 'ClienteNuevo',
    component: ClienteCreateView,
    meta: { title: 'Nuevo Cliente - Sistema Innoquim' }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: ProductosListView,
    meta: { title: 'Productos - Sistema Innoquim' }
  },
  {
    path: '/productos/nuevo',
    name: 'ProductoNuevo',
    component: ProductoCreateView,
    meta: { title: 'Nuevo Producto - Sistema Innoquim' }
  },
  {
    path: '/materias-primas',
    name: 'MateriasPrimas',
    component: MateriasPrimasListView,
    meta: { title: 'Materias Primas - Sistema Innoquim' }
  },
  {
    path: '/materias-primas/nuevo',
    name: 'MateriaPrimaNuevo',
    component: MateriaPrimaCreateView,
    meta: { title: 'Nueva Materia Prima - Sistema Innoquim' }
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
