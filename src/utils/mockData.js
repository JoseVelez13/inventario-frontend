// Ejemplos de respuestas del API Django REST Framework
// Para testear el frontend sin backend funcionando

export const MOCK_RESPONSES = {
  // AUTH - Login
  login: {
    access: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refresh: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@innoquim.com',
      first_name: 'Admin',
      last_name: 'User',
      is_staff: true,
    },
  },

  // DASHBOARD - Estadísticas
  estadisticas: {
    productos_total: 150,
    productos_stock_bajo: 12,
    ordenes_pendientes: 8,
    ordenes_completadas_mes: 45,
    ventas_mes_actual: '125000.00',
    clientes_activos: 34,
    alertas: [
      {
        tipo: 'stock_bajo',
        mensaje: 'Tornillo M8 por debajo del stock mínimo',
        producto_id: 1,
      },
      {
        tipo: 'stock_bajo',
        mensaje: 'Tuerca hexagonal M10 con stock crítico',
        producto_id: 5,
      },
    ],
  },

  // PRODUCTOS - Lista paginada
  productos: {
    count: 150,
    next: 'http://localhost:8000/api/v1/productos?page=2',
    previous: null,
    results: [
      {
        id: 1,
        codigo: 'PROD-001',
        nombre: 'Tornillo M8',
        descripcion: 'Tornillo de acero inoxidable',
        stock_actual: 500,
        stock_minimo: 100,
        precio_unitario: '2.50',
        unidad: {
          id: 1,
          nombre: 'Unidad',
          simbolo: 'UN',
        },
        categoria: 'Ferretería',
        estado: 'activo',
        created_at: '2025-11-01T10:30:00Z',
        updated_at: '2025-11-10T08:15:00Z',
      },
      {
        id: 2,
        codigo: 'PROD-002',
        nombre: 'Tuerca M8',
        descripcion: 'Tuerca hexagonal',
        stock_actual: 300,
        stock_minimo: 50,
        precio_unitario: '1.50',
        unidad: {
          id: 1,
          nombre: 'Unidad',
          simbolo: 'UN',
        },
        categoria: 'Ferretería',
        estado: 'activo',
        created_at: '2025-11-02T14:20:00Z',
        updated_at: '2025-11-10T14:20:00Z',
      },
      {
        id: 3,
        codigo: 'PROD-003',
        nombre: 'Arandela plana M8',
        descripcion: 'Arandela plana de acero',
        stock_actual: 45,
        stock_minimo: 100,
        precio_unitario: '0.80',
        unidad: {
          id: 1,
          nombre: 'Unidad',
          simbolo: 'UN',
        },
        categoria: 'Ferretería',
        estado: 'activo',
        created_at: '2025-11-03T09:15:00Z',
        updated_at: '2025-11-10T09:15:00Z',
      },
    ],
  },

  // PRODUCTO - Detalle
  producto: {
    id: 1,
    codigo: 'PROD-001',
    nombre: 'Tornillo M8',
    descripcion: 'Tornillo de acero inoxidable',
    stock_actual: 500,
    stock_minimo: 100,
    precio_unitario: '2.50',
    unidad: {
      id: 1,
      nombre: 'Unidad',
      simbolo: 'UN',
    },
    categoria: 'Ferretería',
    estado: 'activo',
    created_at: '2025-11-01T10:30:00Z',
    updated_at: '2025-11-10T08:15:00Z',
  },

  // CLIENTES - Lista
  clientes: {
    count: 34,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        nombre: 'Empresa ABC S.A.',
        ruc: '20123456789',
        direccion: 'Av. Principal 123',
        telefono: '+51 999 888 777',
        email: 'contacto@empresaabc.com',
        contacto_principal: 'Juan Pérez',
        estado: 'activo',
        created_at: '2025-10-15T09:00:00Z',
      },
      {
        id: 2,
        nombre: 'Constructora XYZ E.I.R.L.',
        ruc: '20987654321',
        direccion: 'Jr. Los Constructores 456',
        telefono: '+51 988 777 666',
        email: 'ventas@constructoraxyz.com',
        contacto_principal: 'María García',
        estado: 'activo',
        created_at: '2025-10-20T11:30:00Z',
      },
    ],
  },

  // ÓRDENES - Lista
  ordenes: {
    count: 8,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        numero_orden: 'ORD-2025-001',
        cliente: {
          id: 1,
          nombre: 'Empresa ABC S.A.',
        },
        fecha_orden: '2025-11-10',
        fecha_entrega_estimada: '2025-11-20',
        estado: 'pendiente',
        items: [
          {
            id: 1,
            producto: {
              id: 1,
              nombre: 'Tornillo M8',
            },
            cantidad: 100,
            precio_unitario: '2.50',
            subtotal: '250.00',
          },
        ],
        total: '250.00',
        observaciones: 'Entrega urgente',
        created_at: '2025-11-10T10:00:00Z',
      },
      {
        id: 2,
        numero_orden: 'ORD-2025-002',
        cliente: {
          id: 2,
          nombre: 'Constructora XYZ E.I.R.L.',
        },
        fecha_orden: '2025-11-09',
        fecha_entrega_estimada: '2025-11-25',
        estado: 'en_proceso',
        items: [
          {
            id: 2,
            producto: {
              id: 2,
              nombre: 'Tuerca M8',
            },
            cantidad: 200,
            precio_unitario: '1.50',
            subtotal: '300.00',
          },
        ],
        total: '300.00',
        observaciones: '',
        created_at: '2025-11-09T15:30:00Z',
      },
    ],
  },

  // MATERIAS PRIMAS - Lista
  materiasPrimas: {
    count: 45,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        codigo: 'MP-001',
        nombre: 'Acero inoxidable 304',
        descripcion: 'Lámina de acero inoxidable',
        stock_actual: 1200.5,
        stock_minimo: 500,
        precio_unitario: '85.50',
        unidad: {
          id: 2,
          nombre: 'Kilogramo',
          simbolo: 'kg',
        },
        proveedor: 'Aceros del Perú S.A.',
        estado: 'activo',
        created_at: '2025-10-01T08:00:00Z',
      },
    ],
  },

  // INVENTARIO - Movimientos
  movimientos: {
    count: 200,
    next: 'http://localhost:8000/api/v1/inventario/movimientos?page=2',
    previous: null,
    results: [
      {
        id: 1,
        tipo: 'entrada',
        fecha: '2025-11-10T10:30:00Z',
        producto: {
          id: 1,
          nombre: 'Tornillo M8',
        },
        cantidad: 500,
        motivo: 'Compra a proveedor',
        usuario: 'admin',
        observaciones: 'Lote #12345',
      },
      {
        id: 2,
        tipo: 'salida',
        fecha: '2025-11-10T14:20:00Z',
        producto: {
          id: 1,
          nombre: 'Tornillo M8',
        },
        cantidad: 100,
        motivo: 'Orden #ORD-2025-001',
        usuario: 'operador',
        observaciones: 'Cliente: Empresa ABC',
      },
    ],
  },

  // ERRORES - Ejemplos
  error_401: {
    detail: 'Las credenciales de autenticación no se proveyeron.',
  },

  error_400: {
    errors: {
      nombre: ['Este campo es requerido.'],
      precio_unitario: ['Debe ser un número positivo.'],
      stock_actual: ['Asegúrese de que este valor sea mayor o igual a 0.'],
    },
  },

  error_404: {
    detail: 'No encontrado.',
  },

  error_500: {
    detail: 'Error interno del servidor.',
  },
}

export default MOCK_RESPONSES
