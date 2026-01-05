<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">
        Unidades de Medida
        <span class="chip" aria-live="polite" title="Total de unidades">
          <template v-if="!loading">{{ totalUnidades }}</template>
          <template v-else>...</template>
        </span>
      </div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la página anterior">
          <button class="btn-secondary" @click="$router.back()">Atrás</button>
        </Tooltip>
        <Tooltip text="Recargar lista de unidades">
          <button class="btn-secondary" @click="reload">Refrescar</button>
        </Tooltip>
        <Tooltip text="Importar unidades desde archivo">
          <button class="btn-secondary" @click="openImport">📥 Importar</button>
        </Tooltip>
        <Tooltip text="Exportar unidades a archivo">
          <button class="btn-secondary" @click="openExport">📤 Exportar</button>
        </Tooltip>
        <Tooltip text="Crear una nueva unidad">
          <button class="btn-primary" @click="openCreateModal">Nuevo</button>
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
            placeholder="Buscar por nombre o símbolo..." 
            class="search-input"
          />
          <button class="btn-secondary" @click="clearSearch">Limpiar</button>
        </div>

        <div v-if="loading" class="loading-state">Cargando unidades...</div>
        <div v-else-if="error" class="alert-error">{{ error }}</div>
        <div v-else-if="unidades.length === 0" class="empty-state">
          <div class="empty-icon">📏</div>
          <h3>No hay unidades registradas</h3>
          <p>Comienza agregando tu primera unidad de medida</p>
        </div>

        <table v-else class="table">
          <thead>
            <tr>
              <th class="sortable-header" @click="toggleSort('id')">
                <div class="header-content">
                  <span>ID</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'id' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'id' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('nombre')">
                <div class="header-content">
                  <span>Nombre</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'nombre' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'nombre' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th class="sortable-header" @click="toggleSort('simbolo')">
                <div class="header-content">
                  <span>Símbolo</span>
                  <div class="sort-indicator">
                    <i v-if="sortField === 'simbolo' && sortOrder === 'asc'" class="fa-solid fa-sort-up active"></i>
                    <i v-else-if="sortField === 'simbolo' && sortOrder === 'desc'" class="fa-solid fa-sort-down active"></i>
                    <i v-else class="fa-solid fa-sort"></i>
                  </div>
                </div>
              </th>
              
              <th>Factor de Conversión</th>
              <th style="width:100px; text-align:center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="unidad in paginatedUnidades" :key="unidad.id">
              <td>{{ unidad.id }}</td>
              <td><strong>{{ unidad.nombre }}</strong></td>
              <td><span class="badge">{{ unidad.simbolo }}</span></td>
              <td>{{ unidad.factor_conversion || '-' }}</td>
              <td class="action-buttons">
                <Tooltip text="Editar unidad">
                  <button class="btn-icon btn-edit" @click="openEditModal(unidad.id)" aria-label="Editar">
                    ✏️
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar unidad">
                  <button class="btn-icon btn-delete" @click="deleteUnidad(unidad.id)" aria-label="Eliminar">
                    🗑️
                  </button>
                </Tooltip>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="btn-pagination" @click="goToPage(1)" :disabled="currentPage === 1">
            ← Anterior
          </button>
          <div class="pagination-info">
            Página 
            <input 
              v-model.number="currentPage" 
              type="number" 
              min="1" 
              :max="totalPages" 
              class="pagination-input"
            /> 
            de {{ totalPages }}
          </div>
          <button class="btn-pagination" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">
            Siguiente →
          </button>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <UnidadFormModal 
      v-if="showFormModal" 
      :visible="showFormModal" 
      :edit-id="formEditId" 
      @close="showFormModal = false" 
      @saved="handleSaved" 
    />

    <ConfirmDialog 
      v-if="confirmDialog.show" 
      :title="confirmDialog.title" 
      :message="confirmDialog.message" 
      @confirm="confirmDelete" 
      @cancel="confirmDialog.show = false" 
    />

    <ImportExportDialog 
      v-if="importExportDialog.show" 
      :show="importExportDialog.show" 
      :mode="importExportDialog.mode" 
      :data="unidades" 
      :columns="exportColumns" 
      :entity-name="'Unidades'" 
      @close="importExportDialog.show = false" 
      @import-complete="handleImportComplete" 
    />

    <Notification 
      v-if="notification.show" 
      :type="notification.type" 
      :title="notification.title" 
      :message="notification.message" 
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
import UnidadFormModal from '../components/UnidadFormModal.vue'
import unidadesService from '../services/unidadesService'

export default {
  name: 'UnidadesListView',
  components: { 
    HeaderGlobal, 
    Breadcrumbs, 
    Tooltip, 
    ConfirmDialog, 
    ImportExportDialog, 
    Notification, 
    UnidadFormModal 
  },
  
  data() {
    return {
      search: '',
      unidades: [],
      loading: false,
      error: '',
      sortField: 'id',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 15,
      confirmDialog: {
        show: false,
        title: '¿Eliminar unidad?',
        message: 'Esta acción no se puede deshacer.',
        unidadId: null
      },
      importExportDialog: { show: false, mode: 'export' },
      exportColumns: [
        { key: 'id', label: 'ID' },
        { key: 'nombre', label: 'Nombre' },
        { key: 'simbolo', label: 'Símbolo' },
        { key: 'factor_conversion', label: 'Factor de Conversión' }
      ],
      notification: { show: false, type: '', title: '', message: '' },
      showFormModal: false,
      formEditId: null
    }
  },

  computed: {
    totalUnidades() {
      return this.unidades.length
    },
    
    filteredUnidades() {
      let filtered = [...this.unidades]
      
      if (this.search) {
        const searchLower = this.search.toLowerCase()
        filtered = filtered.filter(u => 
          u.nombre.toLowerCase().includes(searchLower) ||
          u.simbolo.toLowerCase().includes(searchLower)
        )
      }
      
      return filtered
    },
    
    sortedUnidades() {
      return this.filteredUnidades.sort((a, b) => {
        let aVal = a[this.sortField]
        let bVal = b[this.sortField]
        
        if (aVal === null || aVal === undefined) aVal = ''
        if (bVal === null || bVal === undefined) bVal = ''
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase()
        if (typeof bVal === 'string') bVal = bVal.toLowerCase()
        
        if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    },
    
    paginatedUnidades() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.sortedUnidades.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.sortedUnidades.length / this.itemsPerPage)
    }
  },

  methods: {
    async fetchUnidades() {
      this.loading = true
      this.error = ''
      try {
        const data = await unidadesService.getUnidades()
        this.unidades = data.results || data
      } catch (e) {
        this.error = 'Error al cargar unidades'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    reload() {
      this.fetchUnidades()
    },

    onSearch() {
      this.currentPage = 1
    },

    clearSearch() {
      this.search = ''
      this.currentPage = 1
    },

    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortOrder = 'asc'
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },

    openImport() {
      this.importExportDialog = { show: true, mode: 'import' }
    },

    openExport() {
      this.importExportDialog = { show: true, mode: 'export' }
    },

    async handleImportComplete(importedData) {
      let successCount = 0
      let errorCount = 0

      for (const unidad of importedData) {
        try {
          const normalized = unidad._normalized || {}
          const cleanData = {
            nombre: String(normalized.nombre || '').trim(),
            simbolo: String(normalized.simbolo || '').trim(),
            factor_conversion: parseFloat(normalized.factor_conversion) || null
          }
          
          await unidadesService.createUnidad(cleanData)
          successCount++
        } catch (e) {
          console.error('Error al importar unidad:', e)
          errorCount++
        }
      }

      this.importExportDialog.show = false
      await this.fetchUnidades()

      const message = `${successCount} unidad(es) importada(s)${errorCount > 0 ? `, ${errorCount} error(es)` : ''}`
      this.showNotification(
        errorCount > 0 ? 'warning' : 'success', 
        errorCount > 0 ? 'Importación parcial' : '¡Importación completada!', 
        message
      )
    },

    deleteUnidad(id) {
      this.confirmDialog.unidadId = id
      this.confirmDialog.show = true
    },

    async confirmDelete() {
      try {
        await unidadesService.deleteUnidad(this.confirmDialog.unidadId)
        this.showNotification('success', '¡Eliminado!', 'Unidad eliminada exitosamente')
        await this.fetchUnidades()
      } catch (e) {
        this.showNotification('error', 'Error', 'No se pudo eliminar la unidad')
        console.error(e)
      } finally {
        this.confirmDialog.show = false
      }
    },

    openCreateModal() {
      this.formEditId = null
      this.showFormModal = true
    },

    openEditModal(id) {
      this.formEditId = id
      this.showFormModal = true
    },

    async handleSaved() {
      await this.fetchUnidades()
      this.showNotification('success', '¡Guardado!', 'Unidad guardada exitosamente')
    },

    showNotification(type, title, message) {
      this.notification = { show: true, type, title, message }
    }
  },

  mounted() {
    this.fetchUnidades()
  }
}
</script>

<style scoped>
@import '../assets/styles/Clientes.css';

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.875rem;
}
</style>
