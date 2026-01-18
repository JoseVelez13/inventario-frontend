# 📋 Documentación: Gestión de Lotes de Producción

## 🎯 Descripción General

La funcionalidad de **Lotes de Producción** permite gestionar la producción de productos de forma estructurada, rastreando:

1. **Lote de Producción**: Agrupa unidades de un producto producidas en una fecha específica
2. **Materiales de Producción**: Tabla intermedia que vincula el lote con las materias primas utilizadas
3. **Stock de Productos**: Actualización automática del inventario de productos

---

## 📊 Relaciones de Datos

```
┌─────────────────────┐
│ LoteProduccion      │
├─────────────────────┤
│ id                  │
│ batch_code (único)  │ ← Código identificador
│ product_id (FK)     │ ──→ Producto que se produce
│ production_date     │
│ produced_quantity   │
│ unit_id (FK)        │
│ status              │ (pending, in_progress, completed, cancelled)
│ production_manager  │ (FK) Usuario responsable
│ created_at          │
│ updated_at          │
└─────────────────────┘
        │
        │ (1 a muchos)
        │
┌─────────────────────────────┐
│ MaterialProduccion          │
│ (Tabla Intermedia)          │
├─────────────────────────────┤
│ id                          │
│ batch_id (FK)               │ ← Vincula al lote
│ raw_material_id (FK)        │ ──→ Materia Prima usada
│ used_quantity               │ ← Cantidad utilizada
│ unit_id (FK)                │
│ created_at                  │
│ updated_at                  │
└─────────────────────────────┘

┌─────────────────┐
│ Producto        │
├─────────────────┤
│ id              │
│ stock (actual)  │ ← Se actualiza con completados
│ ...             │
└─────────────────┘

┌──────────────────┐
│ MateriaPrima     │
├──────────────────┤
│ id               │
│ stock (actual)   │ ← Disminuye al usar
│ stock_minimo     │ ← Alertas si stock < mínimo
│ stock_maximo     │ ← Límite de almacenamiento
│ ...              │
└──────────────────┘
```

---

## 🔄 Flujo de Operaciones

### 1️⃣ Crear un Lote de Producción

```
1. Ir a "Lotes de Producción" desde el Dashboard
2. Click en "Nuevo Lote"
3. Completar formulario:
   - Código Lote: LP001-2025 (único, identifica el lote)
   - Producto: Seleccionar qué se está produciendo
   - Fecha Producción: Cuándo se produjo
   - Cantidad Producida: Cuántas unidades se hicieron
   - Unidad: Unidad de medida (kg, litros, piezas, etc.)
   - Estado: Iniciar en "Pendiente"
   - Gestor: Responsable de la producción
4. Guardar

✅ Resultado: El lote se crea en estado PENDIENTE
```

### 2️⃣ Agregar Materiales al Lote

```
1. Abrir el lote creado (click en ojo o desde listado)
2. En la sección "Materiales Utilizados", click en "+ Agregar Material"
3. Modal de Agregar Material:
   - Materia Prima: Seleccionar cuál se utilizó
   - Cantidad Usada: Cuánta se utilizó (ej: 10kg de sal)
   - Unidad: Unidad de medida
   - Se muestra: Stock actual, mínimo y máximo
4. Guardar

✅ Resultado: Material agregado al lote
⚠️ Nota: El stock de materia prima NO se deduce automáticamente
   (esto se controla manualmente para permitir correcciones)
```

### 3️⃣ Cambiar Estado del Lote

```
Estados disponibles:
├─ Pendiente (initial)
├─ En Proceso (producción en curso)
├─ Completado (listo, actualiza stock del producto)
└─ Cancelado (se descarta, sin efectos)

Cambiar estado:
1. Abrir el lote
2. En la sección "Cambiar Estado"
3. Click en el nuevo estado
4. Confirmar

⚠️ IMPORTANTE:
- Al cambiar a COMPLETADO: El stock del PRODUCTO ↑ en produced_quantity
- Al cambiar a CANCELADO: No afecta ningún stock
- Volver desde COMPLETADO: ⚠️ No se recomienda (requiere backend)
```

### 4️⃣ Gestionar Stock

---

## 📈 Stock de Productos

### Problema: ¿Cómo se maneja el stock del Producto?

El modelo de `Producto` tiene un campo `stock` que puede ser administrado de dos formas:

#### **Opción A: Control Manual (Actual)**
- El stock se actualiza manualmente desde recepciones
- Al completar un lote, se suma la `produced_quantity` al stock del producto
- **Ventajas**: Control total, permite correcciones
- **Desventajas**: Más trabajo manual, riesgo de inconsistencias

#### **Opción B: Control Automático (Recomendado)**
- Sistema automático que deduce stock de materia prima al completar lote
- Sistema automático que suma stock de producto al completar lote
- Mantiene un historial en Kardex
- **Ventajas**: Consistencia automática, menos errores humanos
- **Desventajas**: Menos flexible para correcciones

### Recomendación: **Opción B + Kardex Detallado**

**Flujo sugerido**:

```
1. Recepción de Materia Prima (estado COMPLETADO)
   → Stock MateriaPrima aumenta
   → Registro en Kardex (entrada)

2. Creación de Lote + Materiales
   → Se planifica qué materiales usar
   → Stock NO se deduce aún

3. Lote en Estado "In Progress"
   → Producción en curso
   → Stock MateriaPrima sigue igual

4. Completar Lote (COMPLETED)
   → Stock de CADA MateriaPrima - used_quantity
   → Stock de PRODUCTO + produced_quantity
   → Registro en Kardex (salida de materias, entrada de producto)

5. Recepción de Producto (si viene de otro almacén)
   → Stock Producto aumenta
   → Registro en Kardex
```

### Actualizar Stock Manualmente

Si necesitas ajustar stock sin pasar por lotes:

**Opción 1: Desde Recepciones** (para productos ya hechos)
- Ve a Recepciones → Recepción de Productos
- Crea una recepción con cantidad y almacén
- El stock se actualiza automáticamente

**Opción 2: Desde Materiales** (para materias primas)
- Ve a Materias Primas
- Edita la materia prima
- Ajusta stock_minimo, stock_maximo
- (Nota: stock actual se ajusta desde recepciones)

**Opción 3: A Través del Backend** (para admin)
- Django Admin: `/admin/producto/producto/`
- Editar directamente el campo `stock`

---

## 🎨 Interfaz de Usuario

### Vista de Listado: `/lotes-produccion`

```
┌──────────────────────────────────────────────────────┐
│ Gestión de Lotes de Producción         [⬅️ Atrás] [🔄] [➕ Nuevo] │
├──────────────────────────────────────────────────────┤
│ Filtros:                                              │
│ [Todos] [Pendiente] [En Proceso] [Completado] [Cancelado] │
│                                                       │
│ Buscar: _____________________ [Limpiar]             │
├──────────────────────────────────────────────────────┤
│ Código │ Producto │ Fecha │ Cantidad │ Estado │ ... │
├──────────────────────────────────────────────────────┤
│ LP001  │ Shampoo  │ 15/01 │   50 KG  │ ✅ Comp│ 👁️  │
│ LP002  │ Jabón    │ 16/01 │   25 L   │ ⏳ Proc│ ✏️  │
│ LP003  │ Crema    │ 17/01 │   10 KG  │ ⏳ Pend│ 🗑️  │
└──────────────────────────────────────────────────────┘
```

### Vista de Detalle: `/lotes-produccion/:id`

```
┌────────────────────────────────────────┐
│ Detalles del Lote                      │
├────────────────────────────────────────┤
│ LP001                        [✅ Completado] │
│                                        │
│ Producto: Shampoo                     │
│ Fecha: 15 de enero de 2025           │
│ Cantidad: 50 KG                      │
│ Gestor: Juan García                  │
│                                        │
│ Estado: [Pendiente] [En Proc] [✅ Comp] [Canc] │
├────────────────────────────────────────┤
│ MATERIALES UTILIZADOS    [+ Agregar]   │
├────────────────────────────────────────┤
│ Código │ Material │ Cantidad │ Stock │ ... │
│ MP001  │ Sal     │  5 kg   │ 200 kg│ ✏️ 🗑️ │
│ MP002  │ Ácido   │ 10 L    │ 50 L  │ ✏️ 🗑️ │
│ MP003  │ Perfume │  2 L    │ 8 L   │ ✏️ 🗑️ │
│                                        │
│ Total Materiales: 3                   │
│ Materiales con Stock Bajo: 1 ⚠️       │
└────────────────────────────────────────┘
```

---

## 🔧 Campos Importantes

### Lote de Producción

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `batch_code` | String (50) | **Único** - Código identificador (LP001-2025) |
| `product` | FK | Producto que se está produciendo |
| `production_date` | Date | Fecha de la producción |
| `produced_quantity` | Decimal | Cantidad total producida |
| `unit` | FK | Unidad de medida (kg, litros, piezas) |
| `status` | Enum | pending \| in_progress \| completed \| cancelled |
| `production_manager` | FK | Usuario responsable |
| `created_at` | DateTime | Fecha de creación (auto) |
| `updated_at` | DateTime | Última actualización (auto) |

### Material de Producción

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `batch` | FK | Referencia al lote |
| `raw_material` | FK | Materia prima utilizada |
| `used_quantity` | Decimal | Cantidad usada |
| `unit` | FK | Unidad de medida |
| `created_at` | DateTime | Fecha de creación (auto) |
| `updated_at` | DateTime | Última actualización (auto) |

---

## ⚙️ Operaciones Principales

### CRUD de Lotes

| Operación | Ruta | Método | Descripción |
|-----------|------|--------|-------------|
| Listar | `/api/v1/lotes-produccion/` | GET | Obtener todos los lotes |
| Obtener | `/api/v1/lotes-produccion/{id}/` | GET | Detalles de un lote |
| Crear | `/api/v1/lotes-produccion/` | POST | Crear nuevo lote |
| Actualizar | `/api/v1/lotes-produccion/{id}/` | PUT | Editar lote |
| Eliminar | `/api/v1/lotes-produccion/{id}/` | DELETE | Eliminar lote |
| Cambiar Estado | `/api/v1/lotes-produccion/{id}/` | PATCH | Actualizar solo status |

### CRUD de Materiales

| Operación | Ruta | Método | Descripción |
|-----------|------|--------|-------------|
| Listar | `/api/v1/lotes-produccion/{id}/materiales/` | GET | Materiales del lote |
| Agregar | `/api/v1/lotes-produccion/{id}/materiales/` | POST | Nuevo material |
| Actualizar | `/api/v1/lotes-produccion/{id}/materiales/{mid}/` | PUT | Editar material |
| Eliminar | `/api/v1/lotes-produccion/{id}/materiales/{mid}/` | DELETE | Quitar material |

---

## 💡 Casos de Uso

### Caso 1: Producción de Shampoo
```
1. Crear Lote LP001 → Shampoo → 50 KG → 15/01/2025
2. Agregar Materiales:
   - Sal: 5 KG
   - Ácido: 10 L
   - Perfume: 2 L
3. Cambiar a "En Proceso" (día 15)
4. Completar Lote (día 15, tarde)
   ✅ Stock Shampoo +50 KG
   ✅ Stock Sal -5 KG
   ✅ Stock Ácido -10 L
   ✅ Stock Perfume -2 L
   ✅ Registros en Kardex
```

### Caso 2: Producción Fallida
```
1. Crear Lote LP002 → Jabón → 25 KG
2. Agregar Materiales... (200 pesos gastados)
3. ❌ Falla durante producción
4. Cambiar a "Cancelado"
   ❌ Stock NO se deduce
   ❌ Stock NO se suma
   ⚠️ Se queda como registro para auditoría
```

### Caso 3: Ajustar Stock Manual
```
Si necesitas SOLO actualizar stock del producto:
→ Ve a Recepciones → Recepción de Productos
→ Crea una "recepción" con cantidad
→ El stock se actualiza sin pasar por lotes

Esto es útil para:
- Productos comprados (no producidos)
- Correcciones de inventario
- Devoluciones de clientes
```

---

## ⚠️ Consideraciones Importantes

### 1. Stock de Productos vs Recepciones

El campo `stock` en Producto puede ser actualizado por:
- ✅ Completar un Lote de Producción
- ✅ Crear una Recepción de Producto (compra)
- ✅ Ajuste manual (si es necesario)

**Recomendación**: Mantener Kardex detallado para auditoría

### 2. Validaciones Necesarias (Backend)

```python
# Validar que un lote no se elimine si está COMPLETADO
# Validar que al completar:
#   - stock_materia_prima >= used_quantity
#   - produced_quantity > 0

# Actualizar automáticamente:
#   - Producto.stock += produced_quantity (al completar)
#   - MateriaPrima.stock -= used_quantity (al completar)
#   - Crear registros en Kardex (entrada/salida)
```

### 3. Alertas de Stock

El sistema muestra alertas cuando:
- 🟡 `Stock Materia Prima < Stock Mínimo`
- 🟡 `Stock Materia Prima > Stock Máximo`

Estas se muestran en la vista de detalles

### 4. Permisos Recomendados

```
- Admin: Ver, crear, editar, eliminar TODO
- Gestor de Producción: Ver y editar lotes propios
- Supervisor: Ver TODO, editar lotes
- Vendedor: Solo VER lotes completados
```

---

## 📚 Archivos Creados/Modificados

### Servicios
- ✅ `src/services/loteProduccionService.js` - CRUD de lotes y materiales

### Componentes
- ✅ `src/components/LoteFormModal.vue` - Formulario crear/editar lote
- ✅ `src/components/MaterialProduccionFormModal.vue` - Agregar materiales

### Vistas
- ✅ `src/views/LoteProduccionListView.vue` - Listado de lotes
- ✅ `src/views/LoteProduccionDetailView.vue` - Detalles y materiales

### Estilos
- ✅ `src/assets/styles/LotesProduccion.css` - CSS consistente con proyecto

### Router
- ✅ `src/router/index.js` - Rutas `/lotes-produccion` y `/lotes-produccion/:id`

### Dashboard
- ✅ `src/views/DashboardView.vue` - Nuevo módulo de Lotes

---

## 🚀 Próximos Pasos Recomendados

### En el Backend

1. **Crear Endpoints para Lotes**
   - ViewSet para LoteProduccion
   - ViewSet anidado para MaterialProduccion
   - Action para cambiar estado

2. **Implementar Lógica de Stock**
   - Al completar lote: actualizar stocks
   - Validar disponibilidad de materiales
   - Crear registros automáticos en Kardex

3. **Permisos y Auditoría**
   - Establecer permisos por rol
   - Rastrear quién creó/modificó cada lote
   - Historial de cambios de estado

4. **Reportes**
   - Producción por mes/año
   - Materiales más usados
   - Análisis de costos

### En el Frontend

1. **Optimizaciones**
   - Caché de datos para mejor rendimiento
   - Exportación a PDF/Excel
   - Gráficos de producción

2. **Funcionalidades Avanzadas**
   - Duplicar lotes
   - Plantillas de lotes recurrentes
   - Predicción de stock

3. **Integración**
   - Notificaciones en tiempo real
   - Integración con sistema de órdenes
   - Sincronización con Kardex

---

## 📞 Soporte y Documentación

Para más información:
- Revisar comentarios en el código
- Consultar modelos en `backend/apps/lote_produccion/models.py`
- Ver ejemplos de API en `INTEGRATION.md`

---

**Documentación generada**: Enero 2025
**Versión**: 1.0
**Estado**: ✅ Completo
