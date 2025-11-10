# Sistema de Inventario Innoquim - Frontend

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.12-5A29E4?logo=axios)](https://axios-http.com/)

Sistema de gestión de inventario, productos, clientes y órdenes desarrollado con Vue 3 + Vite, integrado con backend Django REST Framework.

## ✨ Características

- 🔐 **Autenticación JWT** con refresh token automático
- 📊 **Dashboard** con estadísticas en tiempo real
- 📦 **Gestión de productos** con control de stock
- 👥 **Gestión de clientes** y órdenes
- 🧪 **Materias primas** e inventario
- ⚠️ **Alertas** de stock bajo
- 🎨 **UI moderna** y responsive
- 🛡️ **Manejo centralizado de errores**
- 🚀 **Performance optimizada** con Vite

## 🚀 Inicio Rápido

### Requisitos

- Node.js 16+ y npm
- Backend Django corriendo en `http://localhost:8000`

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd inventario-frontend

# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

### Credenciales de Prueba

- **Usuario:** `admin` | **Contraseña:** `admin123`
- **Usuario:** `operador` | **Contraseña:** `operador123`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.vue
│   ├── Footer.vue
│   └── ProducCard.vue
├── services/            # Servicios del API
│   ├── api.js          # Cliente axios configurado
│   ├── auth.js         # Autenticación
│   ├── productosService.js
│   ├── clientesService.js
│   ├── ordenesService.js
│   └── dashboardService.js
├── utils/              # Utilidades
│   ├── errorHandler.js # Manejo de errores
│   └── mockData.js     # Datos de ejemplo
├── views/              # Vistas principales
│   ├── InicioView.vue
│   ├── LoginView.vue
│   ├── RegistroView.vue
│   └── DashboardView.vue
└── router/
    └── index.js        # Configuración de rutas
```

## 🔧 Configuración

### Variables de Entorno

Edita `.env` con la URL de tu backend:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=10000
```

### CORS en Backend

Asegúrate de configurar CORS en Django:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

## 📚 Documentación

- **[INTEGRATION.md](./INTEGRATION.md)** - Guía completa de integración con el backend
- **[API Services](./src/services/)** - Documentación de servicios
- **[Components](./src/components/)** - Componentes disponibles

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🔐 Autenticación

El sistema usa JWT con los siguientes endpoints:

- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/refresh` - Refrescar token
- `GET /api/v1/auth/me` - Usuario actual

Los tokens se almacenan en `localStorage` y se envían automáticamente en cada petición.

## 📊 Servicios del API

### Productos

```javascript
import productosService from '@/services/productosService'

// Listar productos
const productos = await productosService.getProductos({ page: 1 })

// Obtener producto
const producto = await productosService.getProducto(1)

// Crear producto
await productosService.createProducto(datos)
```

### Dashboard

```javascript
import dashboardService from '@/services/dashboardService'

// Estadísticas
const stats = await dashboardService.getEstadisticas()
```

Ver [INTEGRATION.md](./INTEGRATION.md) para más ejemplos.

## 🎨 Componentes Principales

### ProducCard

Tarjeta para mostrar productos:

```vue
<ProducCard 
  :producto="producto" 
  @view="verProducto"
  @edit="editarProducto"
/>
```

## 🐛 Manejo de Errores

El sistema incluye manejo centralizado de errores:

```javascript
import { handleApiError } from '@/utils/errorHandler'

try {
  await productosService.getProductos()
} catch (error) {
  const errorInfo = handleApiError(error)
  console.log(errorInfo.message) // Mensaje amigable
}
```

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/`.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Roadmap

- [ ] Vista CRUD completa de productos
- [ ] Vista de clientes y órdenes
- [ ] Gráficos y reportes avanzados
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación a Excel/PDF
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro

## 👥 Equipo

Desarrollado para **Innoquim** por Nathaly Holguin.

## 📄 Licencia

[Especificar licencia]

---

**Documentación detallada:** Ver [INTEGRATION.md](./INTEGRATION.md) para guía completa de integración con el backend.
