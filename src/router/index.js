import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import DashboardView from '../views/DashboardView.vue'


const routes = [
  { path: '/', component: InicioView },
  { path: '/login', component: LoginView },
  { path: '/registro', component: RegistroView },
  { path: '/dashboard', component: DashboardView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
