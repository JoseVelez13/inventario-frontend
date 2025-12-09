<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">Productos</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de productos">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Crear un nuevo producto">
          <button class="btn-primary" @click="$router.push('/productos/nuevo')">Nuevo</button>
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
            placeholder="Buscar por código, nombre o descripción..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando productos...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No hay productos registrados</h3>
          <p>Comienza agregando tu primer producto</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Peso</th>
              <th style="width:140px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.producto_id">
              <td>{{ p.producto_id }}</td>
              <td><strong>{{ p.product_code }}</strong></td>
              <td>{{ p.name }}</td>
              <td>{{ p.description || '-' }}</td>
              <td>{{ p.unit }}</td>
              <td>{{ p.weight }} kg</td>
              <td>
                <Tooltip text="Editar este producto">
                  <button class="btn-secondary" @click="$router.push(`/productos/nuevo?edit=${p.producto_id}`)">Editar</button>
                </Tooltip>
                <Tooltip text="Eliminar este producto">
                  <button class="btn-primary" style="margin-left:6px; background:#b71c1c" @click="deleteProducto(p.producto_id)">Eliminar</button>
                </Tooltip>
              </td>
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
import '../assets/styles/Productos.css'
import productosService from '../services/productosService'

export default {
  name: 'ProductosListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip },
  
  data() {
    return {
      search: '',
      productos: [],
      loading: false,
      error: '',
    }
  },

  created() {
    this.fetchProductos()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.productos
      return this.productos.filter(p =>
        String(p.producto_id || p.id).includes(q) ||
        p.product_code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      )
    }
  },

  methods: {
    async fetchProductos() {
      this.loading = true
      this.error = ''
      try {
        const data = await productosService.getProductos()
        this.productos = Array.isArray(data) ? data : data.results || []
      } catch (e) {
        console.error('Error al listar productos', e)
        this.error = 'No se pudo cargar la lista de productos.'
      } finally {
        this.loading = false
      }
    },

    onSearch() {},

    clearSearch() {
      this.search = ''
      this.$nextTick(() => {
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
        }
      })
    },

    reload() {
      this.fetchProductos()
    },

    async deleteProducto(id) {
      if (!confirm('¿Eliminar producto definitivamente?')) return
      try {
        await productosService.deleteProducto(id)
        this.productos = this.productos.filter(
          p => (p.producto_id || p.id) !== id
        )
      } catch (e) {
        console.error('Error al eliminar producto', e)
        alert('No se pudo eliminar el producto')
      }
    }
  }
}
</script>
