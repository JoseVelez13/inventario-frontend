# 🚀 INICIO RÁPIDO - Sistema Innoquim

## ✅ El Frontend YA ESTÁ LISTO

El servidor de desarrollo está corriendo en: **http://localhost:5173**

---

## 📝 Lo Que Necesitas Hacer Ahora

### 1️⃣ BACKEND (DJANGO) - LO MÁS IMPORTANTE ⚠️

Tu backend en `d:\proyecBackend\Inventario-Innoquim\` necesita:

#### A. Instalar dependencias adicionales

```bash
cd d:\proyecBackend\Inventario-Innoquim
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

#### B. Configurar settings.py

```python
# innoquim/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Tus apps
    'apps.producto',
    'apps.cliente',
    'apps.almacen',
    # ... resto de apps
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ⚠️ DEBE IR PRIMERO
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

#### C. Crear endpoints básicos de autenticación

```python
# innoquim/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    # Aquí agregarás los endpoints de tus apps
]
```

#### D. Crear un superusuario

```bash
python manage.py createsuperuser
# Usuario: admin
# Password: admin123
```

#### E. Iniciar el backend

```bash
python manage.py runserver
```

---

## 2️⃣ PROBAR LA INTEGRACIÓN

### Paso 1: Verificar que ambos servidores están corriendo

- ✅ Backend Django: http://localhost:8000
- ✅ Frontend Vue: http://localhost:5173 (ya está corriendo)

### Paso 2: Acceder al frontend

1. Abre: http://localhost:5173
2. Verás la página de inicio
3. Haz clic en "Iniciar sesión"
4. Usa las credenciales: `admin` / `admin123`

### Paso 3: Si el login funciona

✅ ¡Todo está integrado correctamente!

El dashboard mostrará:
- Estadísticas (cuando implementes el endpoint)
- Alertas de stock
- Accesos rápidos

### Paso 4: Si el login NO funciona

Revisa en la consola del navegador (F12) el error:

**Si ves error de CORS:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```
→ Solución: Configura CORS en Django (ver punto 1.B)

**Si ves error 404:**
```
POST http://localhost:8000/api/v1/auth/login 404 (Not Found)
```
→ Solución: El endpoint no existe, implementa las URLs (ver punto 1.C)

**Si ves error de conexión:**
```
Network Error
```
→ Solución: El backend Django no está corriendo

---

## 3️⃣ SIGUIENTES PASOS (Backend)

Una vez que el login funcione, implementa estos endpoints:

### Prioridad ALTA (para que el dashboard funcione):

```python
# urls.py
from apps.producto import views as producto_views
from apps.cliente import views as cliente_views

urlpatterns = [
    # ... auth endpoints
    
    # Dashboard
    path('api/v1/dashboard/estadisticas', views.estadisticas_dashboard),
    
    # Productos
    path('api/v1/productos', producto_views.ProductoListCreateView.as_view()),
    path('api/v1/productos/<int:pk>', producto_views.ProductoDetailView.as_view()),
]
```

### Prioridad MEDIA:

- Endpoints de clientes
- Endpoints de órdenes
- Endpoints de materias primas

### Prioridad BAJA:

- Reportes avanzados
- Exportación de datos
- Notificaciones

---

## 4️⃣ ESTRUCTURA DE RESPUESTAS

El frontend espera estas estructuras JSON:

### Login Response:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@innoquim.com",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

### Dashboard Estadísticas:
```json
{
  "productos_total": 150,
  "productos_stock_bajo": 12,
  "ordenes_pendientes": 8,
  "ordenes_completadas_mes": 45,
  "ventas_mes_actual": "125000.00",
  "clientes_activos": 34,
  "alertas": [
    {
      "tipo": "stock_bajo",
      "mensaje": "Tornillo M8 por debajo del stock mínimo",
      "producto_id": 1
    }
  ]
}
```

### Lista de Productos:
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/productos?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "codigo": "PROD-001",
      "nombre": "Tornillo M8",
      "stock_actual": 500,
      "stock_minimo": 100,
      "precio_unitario": "2.50",
      "unidad": {
        "id": 1,
        "nombre": "Unidad",
        "simbolo": "UN"
      }
    }
  ]
}
```

Ver más ejemplos en: `src/utils/mockData.js`

---

## 🆘 TROUBLESHOOTING

### Frontend no se conecta al backend

1. Verifica `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```

2. Reinicia el servidor de Vite:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

### Error 401 Unauthorized

El token expiró o no es válido:
1. Cierra sesión
2. Vuelve a iniciar sesión

### Error 500 en el backend

Revisa los logs de Django en la consola donde corre `python manage.py runserver`

---

## 📚 DOCUMENTACIÓN COMPLETA

- **[README.md](./README.md)** - Información general del proyecto
- **[INTEGRATION.md](./INTEGRATION.md)** - Guía completa de integración
- **[CHANGELOG.md](./CHANGELOG.md)** - Resumen de cambios
- **[src/utils/mockData.js](./src/utils/mockData.js)** - Ejemplos de respuestas

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Frontend (YA HECHO ✅)
- [x] Variables de entorno configuradas
- [x] Servicios del API creados
- [x] Vistas de Login/Registro/Dashboard
- [x] Manejo de errores
- [x] Guards de autenticación
- [x] Componentes de UI
- [x] Documentación completa

### Backend (PENDIENTE ⏳)
- [ ] Django REST Framework instalado
- [ ] CORS configurado
- [ ] JWT authentication configurado
- [ ] Endpoint de login funcional
- [ ] Endpoint de estadísticas creado
- [ ] ViewSets de productos creados
- [ ] Superusuario creado (admin/admin123)
- [ ] Servidor corriendo en puerto 8000

---

## 🎯 OBJETIVO INMEDIATO

**Meta:** Ver el dashboard con datos reales del backend

**Pasos:**
1. ✅ Frontend listo (YA ESTÁ)
2. ⏳ Configurar Django (settings.py)
3. ⏳ Crear endpoint de login
4. ⏳ Crear endpoint de estadísticas
5. ⏳ Probar login desde http://localhost:5173

**Tiempo estimado:** 30-60 minutos

---

## 💡 TIPS

- Usa el Django Admin (http://localhost:8000/admin) para crear datos de prueba
- Revisa la consola del navegador (F12) para ver peticiones del API
- Usa Postman o Thunder Client para probar los endpoints antes de conectar el frontend
- Los datos mock en `src/utils/mockData.js` te muestran el formato exacto esperado

---

**¡El frontend está 100% listo! Ahora solo falta implementar el backend Django.** 🚀
