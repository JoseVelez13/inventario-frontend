<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="bg-fondo-clientes"></div>

    <div class="topbar">
      <div class="topbar-title">Clientes</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de clientes">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo cliente">
          <button class="btn-primary" @click="$router.push('/clientes/nuevo')">Nuevo</button>
        </Tooltip>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <div class="search-bar">
          <input 
            v-model="search" 
            @input="onSearch" 
            type="text" 
            placeholder="Buscar por RUC, Empresa, Contacto..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>
        <div v-if="loading" class="loading-state">Cargando clientes...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No hay clientes registrados</h3>
          <p>Comienza agregando tu primer cliente</p>
          <button class="btn-primary" @click="$router.push('/clientes/nuevo')">
            Crear primer cliente
          </button>
        </div>
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
                <Tooltip text="Editar este cliente">
                  <button class="btn-secondary" @click="$router.push(`/clientes/nuevo?edit=${c.cliente_id}`)">Editar</button>
                </Tooltip>
                <Tooltip text="Eliminar este cliente">
                  <button class="btn-primary" style="margin-left:6px; background:#b71c1c" @click="deleteCliente(c.cliente_id)">Eliminar</button>
                </Tooltip>
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
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import '../assets/styles/Clientes.css'
import clientesService from '../services/clientesService'

export default {
  name: 'ClientesListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip },
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

      // Soporte para paginación de DRF
      this.clientes = Array.isArray(data) ? data : data.results || []
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
