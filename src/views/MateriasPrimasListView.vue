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
        <Tooltip text="Importar materias primas desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar materias primas a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
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

    <ConfirmDialog
      :show="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      @confirm="onConfirmDelete"
      @cancel="confirmDialog.show = false"
    />

    <ImportExportDialog
      :show="importExportDialog.show"
      :mode="importExportDialog.mode"
      :data="materiasPrimas"
      :columns="exportColumns"
      :item-count="materiasPrimas.length"
      entity-name="Materias Primas"
      :api-endpoint="apiEndpoint"
      @close="importExportDialog.show = false"
      @import-complete="handleImportComplete"
    />

    <Notification
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      @close="notification.show = false"
    />
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ImportExportDialog from '../components/ImportExportDialog.vue'
import Notification from '../components/Notification.vue'
import '../assets/styles/MateriasPrimas.css'
import materiasPrimasService from '../services/materiasPrimasService'

export default {
  name: 'MateriasPrimasListView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, ConfirmDialog, ImportExportDialog, Notification },
  
  data() {
    return {
      search: '',
      materiasPrimas: [],
      loading: false,
      error: '',
      confirmDialog: {
        show: false,
        title: '¿Eliminar materia prima?',
        message: 'Esta acción no se puede deshacer.',
        materiaPrimaId: null
      },
      importExportDialog: { show: false, mode: 'export' },
      apiEndpoint: 'http://localhost:8000/api/materias-primas/',
      exportColumns: [
        { key: 'materia_prima_id', label: 'ID' },
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'unidad', label: 'Unidad' },
        { key: 'densidad', label: 'Densidad (g/cm³)' },
        { key: 'stock_minimo', label: 'Stock Mínimo' },
        { key: 'stock_maximo', label: 'Stock Máximo' }
      ],
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
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

    openImport() {
      this.importExportDialog = { show: true, mode: 'import' }
    },

    openExport() {
      this.importExportDialog = { show: true, mode: 'export' }
    },

    isStockBajo(mp) {
      // Aquí podrías comparar con stock actual si está disponible
      // Por ahora solo es visual basado en stock_minimo
      return false
    },

    deleteMateriaPrima(id) {
      this.confirmDialog.materiaPrimaId = id
      this.confirmDialog.show = true
    },

    async onConfirmDelete() {
      const id = this.confirmDialog.materiaPrimaId
      try {
        await materiasPrimasService.deleteMateriaPrima(id)
        this.materiasPrimas = this.materiasPrimas.filter(mp => mp.materia_prima_id !== id)
        this.confirmDialog.show = false
        this.notification = {
          show: true,
          message: 'Materia prima eliminada exitosamente',
          type: 'success'
        }
      } catch (e) {
        console.error('Error al eliminar materia prima', e)
        this.notification = {
          show: true,
          message: 'No se pudo eliminar la materia prima',
          type: 'error'
        }
      }
    },

    async handleImportComplete(importedData) {
      console.log('Datos importados:', importedData)
      let successCount = 0
      let errorCount = 0

      for (const materiaPrima of importedData) {
        try {
          await materiasPrimasService.createMateriaPrima(materiaPrima)
          successCount++
        } catch (e) {
          console.error('Error al importar materia prima:', e)
          errorCount++
        }
      }

      if (errorCount === 0) {
        this.notification = {
          show: true,
          message: `${successCount} materia(s) prima(s) importada(s) exitosamente`,
          type: 'success'
        }
      } else {
        this.notification = {
          show: true,
          message: `${successCount} importadas, ${errorCount} con errores`,
          type: 'warning'
        }
      }
      
      this.fetchMateriasPrimas()
    }
  }
}
</script>
