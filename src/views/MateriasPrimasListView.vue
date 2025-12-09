<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">Materias Primas</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de materias primas">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Crear una nueva materia prima">
          <button class="btn-primary" @click="$router.push('/materias-primas/nuevo')">Nuevo</button>
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

        <div v-if="loading" class="loading-state">Cargando materias primas...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="filtered.length === 0" class="empty-state">
          <div class="empty-icon">🧪</div>
          <h3>No hay materias primas registradas</h3>
          <p>Comienza agregando tu primera materia prima</p>
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Densidad</th>
              <th>Stock Mín.</th>
              <th>Stock Máx.</th>
              <th style="width:140px">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mp in filtered" :key="mp.materia_prima_id" :class="{'row-warning': isStockBajo(mp)}">
              <td>{{ mp.materia_prima_id }}</td>
              <td><strong>{{ mp.codigo }}</strong></td>
              <td>{{ mp.nombre }}</td>
              <td>{{ mp.descripcion || '-' }}</td>
              <td>{{ mp.unidad || '-' }}</td>
              <td>{{ mp.densidad ? mp.densidad + ' g/cm³' : '-' }}</td>
              <td>
                <span :class="{'badge-warning': isStockBajo(mp)}">
                  {{ mp.stock_minimo || 0 }}
                </span>
              </td>
              <td>{{ mp.stock_maximo || '-' }}</td>
              <td>
                <Tooltip text="Editar esta materia prima">
                  <button class="btn-secondary" @click="$router.push(`/materias-primas/nuevo?edit=${mp.materia_prima_id}`)">Editar</button>
                </Tooltip>
                <Tooltip text="Eliminar esta materia prima">
                  <button class="btn-primary" style="margin-left:6px; background:#b71c1c" @click="deleteMateriaPrima(mp.materia_prima_id)">Eliminar</button>
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
import '../assets/styles/MateriasPrimas.css'
import materiasPrimasService from '../services/materiasPrimasService'

export default {
  name: 'MateriasPrimasListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip },
  
  data() {
    return {
      search: '',
      materiasPrimas: [],
      loading: false,
      error: '',
    }
  },

  created() {
    this.fetchMateriasPrimas()
  },

  computed: {
    filtered() {
      const q = this.search.trim().toLowerCase()
      if (!q) return this.materiasPrimas
      return this.materiasPrimas.filter(mp =>
        String(mp.materia_prima_id || mp.id).includes(q) ||
        mp.codigo.toLowerCase().includes(q) ||
        mp.nombre.toLowerCase().includes(q) ||
        (mp.descripcion || '').toLowerCase().includes(q)
      )
    }
  },

  methods: {
    async fetchMateriasPrimas() {
      this.loading = true
      this.error = ''
      try {
        const data = await materiasPrimasService.getMateriasPrimas()
        this.materiasPrimas = Array.isArray(data) ? data : data.results || []
      } catch (e) {
        console.error('Error al listar materias primas', e)
        this.error = 'No se pudo cargar la lista de materias primas.'
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
      this.fetchMateriasPrimas()
    },

    isStockBajo(mp) {
      // Aquí podrías comparar con stock actual si está disponible
      // Por ahora solo es visual basado en stock_minimo
      return false
    },

    async deleteMateriaPrima(id) {
      if (!confirm('¿Estás seguro de eliminar esta materia prima?')) return
      try {
        await materiasPrimasService.deleteMateriaPrima(id)
        this.materiasPrimas = this.materiasPrimas.filter(mp => mp.materia_prima_id !== id)
      } catch (e) {
        console.error('Error al eliminar materia prima', e)
        alert('No se pudo eliminar la materia prima.')
      }
    }
  }
}
</script>
