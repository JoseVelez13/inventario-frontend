import { createRouter, createWebHistory } from 'vue-router'

import InicioView from '../views/InicioView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import DashboardView from '../views/DashboardView.vue'
const routes = [
  { path: '/', name: 'inicio', component: InicioView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/registro', name: 'registro', component: RegistroView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },

  // ruta fallback para errores (si alguien entra a /xd123)
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
