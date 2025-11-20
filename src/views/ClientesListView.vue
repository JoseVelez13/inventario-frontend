<template>
  <div class="page-container">
    <HeaderGlobal />
    <div class="bg-fondo-clientes"></div>

    <div class="topbar">
      <div class="topbar-title">Clientes</div>
      <div class="topbar-actions">
        <button class="btn-secondary" @click="$router.back()">Atrás</button>
        <button class="btn-secondary" @click="reload">Refrescar</button>
        <button class="btn-primary" @click="$router.push('/clientes/nuevo')">Nuevo</button>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <div style="display:flex; gap:10px; margin-bottom: 12px;">
          <input v-model="search" @input="onSearch" type="text" placeholder="Buscar por RUC, Empresa, Contacto..." style="flex:1; padding:10px 12px; border:1px solid #dfe7ef; border-radius: 8px;"/>
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUC</th>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.cliente_id">
              <td>{{ c.cliente_id }}</td>
              <td>{{ c.ruc }}</td>
              <td>{{ c.nombre_empresa }}</td>
              <td>{{ c.nombre_contacto || '-' }}</td>
              <td>{{ c.telefono || '-' }}</td>
              <td>{{ c.email }}</td>
              <td>{{ c.direccion }}</td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="7" style="text-align:center; color:#6b7c93; padding: 16px;">Sin resultados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import '../assets/styles/Clientes.css'

// Datos mock locales (sin backend aún)
const MOCK_CLIENTES = [
  {
    cliente_id: 'CL000001', ruc: '0999999999001', nombre_empresa: 'Innoquim S.A.',
    nombre_contacto: 'Juan Pérez', telefono: '+593 99 999 9999',
    email: 'contacto@innoquim.com', direccion: 'Av. Principal 123, Manta'
  },
  {
    cliente_id: 'CL000002', ruc: '0912345678001', nombre_empresa: 'Constructora XYZ Cia. Ltda.',
    nombre_contacto: 'María García', telefono: '+593 98 888 7777',
    email: 'ventas@constructoraxyz.com', direccion: 'Calle 10 y Av. 5, Manta'
  },
]

export default {
  name: 'ClientesListView',
  components: { HeaderGlobal },
  data() {
    return {
      search: '',
      clientes: MOCK_CLIENTES,
    }
  },
  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.clientes
      return this.clientes.filter(c =>
        c.cliente_id.toLowerCase().includes(q) ||
        c.ruc.toLowerCase().includes(q) ||
        c.nombre_empresa.toLowerCase().includes(q) ||
        (c.nombre_contacto || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
  },
  methods: {
    onSearch() {},
    clearSearch() { this.search = '' },
    reload() {/* placeholder */}
  }
}
</script>
