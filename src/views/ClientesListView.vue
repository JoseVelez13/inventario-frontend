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
        <div v-if="loading" style="padding:12px; color:#6b7c93;">Cargando clientes...</div>
        <div v-else-if="error" class="alert-error" style="padding:12px; border:1px solid #fcc; background:#fee; color:#c00; border-radius:8px;">{{ error }}</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>RUC</th>
              <th>Empresa</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th style="width:140px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.cliente_id">
              <td class="h">{{ c.cliente_id }}</td>
              <td class="h">{{ c.ruc }}</td>
              <td class="h">{{ c.nombre_empresa }}</td>
              <td class="h">{{ c.nombre_contacto || '-' }}</td>
              <td class="h">{{ c.telefono || '-' }}</td>
              <td class="h">{{ c.email }}</td>
              <td class="h">{{ c.direccion }}</td>
              <td>
                <button class="btn-secondary" @click="$router.push(`/clientes/nuevo?edit=${c.cliente_id}`)">Editar</button>
                <button class="btn-primary" style="margin-left:6px; background:#b71c1c" @click="deleteCliente(c.cliente_id)">Eliminar</button>

              </td>
            </tr>
            <tr v-if="filtered.length === 0">
              <td colspan="8" style="text-align:center; color:#6b7c93; padding: 16px;">Sin resultados</td>
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
import clientesService from '../services/clientesService'

export default {
  name: 'ClientesListView',
  components: { HeaderGlobal },
  data() {
    return {
      search: '',
      clientes: [],
      loading: false,
      error: '',
    }
  },

  created() {
    this.fetchClientes()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.clientes
      return this.clientes.filter(c =>
        String(c.cliente_id || c.id).includes(q) ||
        c.ruc.toLowerCase().includes(q) ||
        c.nombre_empresa.toLowerCase().includes(q) ||
        (c.nombre_contacto || '').toLowerCase().includes(q) ||
        (c.telefono || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
  },

  methods: {
    async fetchClientes() {
  this.loading = true
  this.error = ''
  try {
    const data = await clientesService.getClientes()
    this.clientes = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Error al listar clientes', e)
    this.error = 'No se pudo cargar la lista de clientes.'
  } finally {
    this.loading = false
  }
},

    onSearch() {},

    clearSearch() {
      this.search = ''
    },

    reload() {
      this.fetchClientes()
    },

    async deleteCliente(id) {
      if (!confirm('¿Eliminar cliente definitivamente?')) return
      try {
        await clientesService.deleteCliente(id)
        this.clientes = this.clientes.filter(
          c => (c.cliente_id || c.id) !== id
        )
      } catch (e) {
        console.error('Error al eliminar cliente', e)
        alert('No se pudo eliminar el cliente')
      }
    }
  }
}
</script>
