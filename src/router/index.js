import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import DashboardView from '../views/DashboardView.vue'
import auth from '../services/auth'


const routes = [
  { path: '/', component: InicioView },
  { path: '/login', component: LoginView },
  { path: '/registro', component: RegistroView },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Simple global guard for routes that require auth
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAuth && !auth.isAuthenticated()) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
