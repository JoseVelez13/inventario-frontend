import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import ClientesListView from '../views/ClientesListView.vue'
import ProductosListView from '../views/ProductosListView.vue'
import MateriasPrimasListView from '../views/MateriasPrimasListView.vue'
import MateriaPrimaCreateView from '../views/MateriaPrimaCreateView.vue'
import ProveedoresListView from '../views/ProveedoresListView.vue'
import AlmacenesListView from '../views/AlmacenesListView.vue'
import UnidadesListView from '../views/UnidadesListView.vue'
import KardexListView from '../views/KardexListView.vue'
import RecepcionesMaterialListView from '../views/RecepcionesMaterialListView.vue'
import RecepcionesItemListView from '../views/RecepcionesItemListView.vue'
import LoteProduccionListView from '../views/LoteProduccionListView.vue'
import LoteProduccionDetailView from '../views/LoteProduccionDetailView.vue'
import ArchivosGDriveView from '../views/ArchivosGDriveView.vue'
import CategoriasListView from '../views/CategoriasListView.vue'
import InventarioMaterialesListView from '../views/InventarioMaterialesListView.vue'
import OrdenesClienteListView from '../views/OrdenesClienteListView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import authService from '../services/auth'
import ProfileView from '../views/ProfileView.vue'
import AuthCallbackView from '../views/AuthCallbackView.vue'

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: DashboardView,
    meta: {
      title: 'Dashboard - Sistema Innoquim',
      description: 'Panel principal del sistema Innoquim para gestión de inventario, productos, clientes y lotes de producción.',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Iniciar Sesión - Sistema Innoquim',
      description: 'Accede al sistema Innoquim para gestionar tu inventario y operaciones empresariales.',
      hideForAuth: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      title: 'Dashboard - Sistema Innoquim',
      description: 'Panel principal del sistema Innoquim para gestión de inventario, productos, clientes y lotes de producción.'
    }
  },
  {
    path: '/perfil',
    name: 'Profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'Mi Perfil - Sistema Innoquim',
      description: 'Consulta y edita la información de tu perfil de usuario en el sistema Innoquim.'
    }
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: ClientesListView,
    meta: {
      title: 'Clientes - Sistema Innoquim',
      description: 'Gestión de empresas y contactos en el sistema Innoquim.',
      requiresAuth: true
    }
  },
  {
    path: '/productos',
    name: 'Productos',
    component: ProductosListView,
    meta: {
      title: 'Productos - Sistema Innoquim',
      description: 'Control y administración de productos en el sistema Innoquim.',
      requiresAuth: true
    }
  },
  {
    path: '/materias-primas',
    name: 'MateriasPrimas',
    component: MateriasPrimasListView,
    meta: {
      title: 'Materias Primas - Sistema Innoquim',
      description: 'Gestión de insumos y materias primas para la producción.',
      requiresAuth: true
    }
  },
  {
    path: '/materias-primas/nuevo',
    name: 'MateriaPrimaNuevo',
    component: MateriaPrimaCreateView,
    meta: { title: 'Nueva Materia Prima - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/proveedores',
    name: 'Proveedores',
    component: ProveedoresListView,
    meta: { title: 'Proveedores - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/almacenes',
    name: 'Almacenes',
    component: AlmacenesListView,
    meta: { title: 'Almacenes - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/unidades',
    name: 'Unidades',
    component: UnidadesListView,
    meta: { title: 'Unidades de Medida - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/kardex',
    name: 'Kardex',
    component: KardexListView,
    meta: { title: 'Kardex de Inventario - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/recepciones',
    name: 'RecepcionesMaterial',
    component: RecepcionesMaterialListView,
    meta: { title: 'Recepciones de Material - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/recepciones-productos',
    name: 'RecepcionesProductos',
    component: RecepcionesItemListView,
    meta: { title: 'Recepciones de Productos - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/lotes-produccion',
    name: 'LotesProduccion',
    component: LoteProduccionListView,
    meta: { title: 'Lotes de Producción - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/lotes-produccion/:id',
    name: 'LoteProduccionDetail',
    component: LoteProduccionDetailView,
    meta: { title: 'Detalle de Lote - Sistema Innoquim', requiresAuth: true }
  },
  {
    path: '/archivos-drive',
    name: 'ArchivosGDrive',
    component: ArchivosGDriveView,
    meta: {
      title: 'Archivos en Google Drive - Sistema Innoquim',
      requiresAuth: true
    }
  },
  {
    path: '/categorias',
    name: 'Categorias',
    component: CategoriasListView,
    meta: {
      title: 'Categorías - Sistema Innoquim',
      requiresAuth: true
    }
  },
  {
    path: '/inventario-materiales',
    name: 'InventarioMateriales',
    component: InventarioMaterialesListView,
    meta: {
      title: 'Inventario de Materiales - Sistema Innoquim',
      requiresAuth: true
    }
  },
  {
    path: '/ordenes-cliente',
    name: 'OrdenesCliente',
    component: OrdenesClienteListView,
    meta: {
      title: 'Órdenes de Cliente - Sistema Innoquim',
      requiresAuth: true
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallbackView,
    meta: {
      title: 'Autenticación - Sistema Innoquim'
    }
  },
  // Página 404 personalizada
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: 'Página no encontrada - Sistema Innoquim' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard global para proteger rutas que requieren autenticación y actualizar metadatos SEO
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()

  // Actualizar título de la página
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Actualizar meta descripción si existe en la ruta
  if (to.meta.description) {
    let descriptionTag = document.querySelector('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.setAttribute('name', 'description')
      document.head.appendChild(descriptionTag)
    }
    descriptionTag.setAttribute('content', to.meta.description)
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