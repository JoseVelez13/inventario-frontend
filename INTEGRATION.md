# Sistema Innoquim - Frontend

Sistema de gestión de inventario para Innoquim desarrollado con Vue 3 + Vite.

## 🚀 Integración con Backend Django REST Framework

Este frontend está completamente integrado con el backend Django. A continuación se detallan los pasos de configuración y uso.

## 📋 Requisitos Previos

- Node.js 16+ y npm/yarn
- Backend Django corriendo en `http://localhost:8000` (o configurar URL en `.env`)

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (ya existe `.env.example` como plantilla):

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
```

**Entornos disponibles:**
- Desarrollo: `http://localhost:8000/api/v1`
- Staging: `https://staging-api.innoquim.com/api/v1`
- Producción: `https://api.innoquim.com/api/v1`

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Credenciales de prueba:

- **Usuario:** `admin` | **Contraseña:** `admin123`
- **Usuario:** `operador` | **Contraseña:** `operador123`

### Flujo de autenticación:

1. **Login:** POST `/api/v1/auth/login`
   - Guarda `access_token` y `refresh_token` en localStorage
   - Redirige automáticamente al dashboard

2. **Refresh automático:** 
   - Interceptor de axios refresca el token cuando expira (401)
   - Transparente para el usuario

3. **Logout:** POST `/api/v1/auth/logout`
   - Limpia tokens del localStorage
   - Redirige a la página de login

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.vue
│   ├── Footer.vue
│   └── ProducCard.vue   # Tarjeta de producto con datos del API
├── services/            # Servicios para consumir el API
│   ├── api.js           # Cliente axios configurado con interceptores
│   ├── auth.js          # Servicio de autenticación (login, logout, register)
│   ├── productosService.js
│   ├── clientesService.js
│   ├── ordenesService.js
│   ├── dashboardService.js
│   ├── materiasPrimasService.js
│   └── inventarioService.js
├── utils/               # Utilidades
│   └── errorHandler.js  # Manejo centralizado de errores del API
├── views/               # Vistas/Páginas
│   ├── InicioView.vue
│   ├── LoginView.vue    # Login con username/password
│   ├── RegistroView.vue # Registro de nuevos usuarios
│   └── DashboardView.vue # Dashboard con estadísticas del API
├── router/
│   └── index.js         # Router con guards de autenticación
└── main.js
```

## 🌐 Servicios del API

### AuthService (`src/services/auth.js`)

```javascript
import authService from '@/services/auth'

// Login
await authService.login(username, password)

// Registro
await authService.register(userData)

// Logout
await authService.logout()

// Verificar autenticación
const isAuth = authService.isAuthenticated()

// Obtener usuario actual
const user = authService.getUser()

// Obtener token
const token = authService.getToken()
```

### ProductosService (`src/services/productosService.js`)

```javascript
import productosService from '@/services/productosService'

// Listar productos con paginación y filtros
const productos = await productosService.getProductos({
  page: 1,
  page_size: 20,
  search: 'tornillo',
  ordering: '-created_at'
})

// Obtener producto por ID
const producto = await productosService.getProducto(1)

// Crear producto
const nuevoProducto = await productosService.createProducto({
  codigo: 'PROD-001',
  nombre: 'Tornillo M8',
  stock_actual: 500,
  precio_unitario: 2.50
})

// Actualizar producto
await productosService.updateProducto(1, datosActualizados)

// Eliminar producto
await productosService.deleteProducto(1)

// Productos con stock bajo
const stockBajo = await productosService.getProductosStockBajo()
```

### DashboardService (`src/services/dashboardService.js`)

```javascript
import dashboardService from '@/services/dashboardService'

// Obtener estadísticas del dashboard
const stats = await dashboardService.getEstadisticas()
// Retorna: productos_total, stock_bajo, ordenes_pendientes, ventas_mes, etc.

// Reportes
const reporteInventario = await dashboardService.getReporteInventario()
const reporteVentas = await dashboardService.getReporteVentas()
```

### Otros servicios

- `clientesService` - Gestión de clientes
- `ordenesService` - Gestión de órdenes
- `materiasPrimasService` - Gestión de materias primas
- `inventarioService` - Control de inventario (entradas/salidas)

## 🛡️ Manejo de Errores

El sistema incluye un manejador centralizado de errores del API:

```javascript
import { handleApiError, getErrorMessage } from '@/utils/errorHandler'

try {
  await productosService.getProductos()
} catch (error) {
  const errorInfo = handleApiError(error)
  console.log(errorInfo.message) // Mensaje amigable
  console.log(errorInfo.type)    // 'validation', 'unauthorized', etc.
  console.log(errorInfo.errors)  // Errores de validación por campo
}
```

**Tipos de errores manejados:**
- 400: Validación de datos
- 401: No autorizado
- 403: Sin permisos
- 404: No encontrado
- 500: Error del servidor

## 🧭 Rutas y Guards

El router incluye guards de autenticación automáticos:

```javascript
// Rutas protegidas (requieren autenticación)
{ 
  path: '/dashboard', 
  component: DashboardView, 
  meta: { requiresAuth: true } 
}

// Rutas ocultas para usuarios autenticados
{ 
  path: '/login', 
  component: LoginView,
  meta: { hideForAuth: true } 
}
```

## 📊 Componente ProducCard

Componente para mostrar tarjetas de productos con datos del API:

```vue
<template>
  <ProducCard 
    :producto="producto" 
    :showEdit="true"
    @view="verProducto"
    @edit="editarProducto"
  />
</template>

<script setup>
import ProducCard from '@/components/ProducCard.vue'

const producto = {
  id: 1,
  codigo: 'PROD-001',
  nombre: 'Tornillo M8',
  descripcion: 'Tornillo de acero inoxidable',
  stock_actual: 500,
  stock_minimo: 100,
  precio_unitario: '2.50',
  unidad: { id: 1, nombre: 'Unidad', simbolo: 'UN' },
  categoria: 'Ferretería',
  estado: 'activo'
}
</script>
```

## 🔧 Configuración CORS en Backend

Asegúrate de que el backend Django tiene configurado CORS para permitir peticiones desde el frontend:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True
```

## 📦 Build para Producción

```bash
# Crear build optimizado
npm run build

# Preview del build
npm run preview
```

Los archivos se generan en la carpeta `dist/`.

## 🐛 Debugging

### Ver peticiones del API en consola

```javascript
// api.js ya incluye logs en desarrollo
console.log('Request:', config)
console.log('Response:', response)
console.log('Error:', error)
```

### Verificar token en localStorage

Abre DevTools > Application > Local Storage:
- `access_token`: Token JWT de acceso
- `refresh_token`: Token para refrescar
- `user`: Datos del usuario (JSON)

## 📝 Próximos Pasos

### Backend (Django)
1. Implementar endpoints de autenticación (`/api/v1/auth/login`, `/auth/register`)
2. Crear ViewSets para productos, clientes, órdenes
3. Implementar endpoint de estadísticas (`/dashboard/estadisticas`)
4. Configurar permisos y autenticación JWT
5. Habilitar CORS para `http://localhost:5173`

### Frontend (Este proyecto)
1. Crear vistas para gestión de productos (CRUD completo)
2. Crear vistas para clientes y órdenes
3. Implementar filtros y búsqueda avanzada
4. Añadir gráficos/charts para reportes
5. Implementar paginación en listados

## 🤝 Colaboración

Este frontend está listo para conectarse con el backend Django REST Framework una vez que los endpoints estén implementados.

**Contacto:** [Tu nombre/email]

## 📄 Licencia

[Especificar licencia]
