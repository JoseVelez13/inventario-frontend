<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">{{ isEdit ? 'Editar Materia Prima' : 'Nueva Materia Prima' }}</div>
      <div class="topbar-actions">
        <Tooltip text="Volver a la lista">
          <button class="btn-secondary" @click="$router.push('/materias-primas')">Cancelar</button>
        </Tooltip>
        <Tooltip text="Limpiar formulario">
          <button class="btn-secondary" @click="resetForm">Limpiar</button>
        </Tooltip>
        <Tooltip text="Guardar materia prima">
          <button class="btn-primary" @click="save">Guardar</button>
        </Tooltip>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <div v-if="error" class="alert-error">{{ error }}</div>
        
        <form @submit.prevent="save" class="form-grid">
          <div class="form-group">
            <label for="codigo">Código <span class="required">*</span></label>
            <input 
              id="codigo"
              v-model="form.codigo" 
              type="text" 
              placeholder="ej: AC-SUL-98"
              required
              maxlength="50"
            />
            <small>Código único/SKU para identificar la materia prima</small>
          </div>

          <div class="form-group">
            <label for="nombre">Nombre <span class="required">*</span></label>
            <input 
              id="nombre"
              v-model="form.nombre" 
              type="text" 
              placeholder="ej: Ácido Sulfúrico"
              required
              maxlength="255"
            />
          </div>

          <div class="form-group full-width">
            <label for="descripcion">Descripción</label>
            <textarea 
              id="descripcion"
              v-model="form.descripcion" 
              rows="3"
              placeholder="Especificaciones técnicas, pureza, propiedades químicas, etc."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="unidad_id">Unidad de Medida <span class="required">*</span></label>
            <select id="unidad_id" v-model="form.unidad_id" required>
              <option value="">Seleccione una unidad</option>
              <option value="1">kg (Kilogramo)</option>
              <option value="2">g (Gramo)</option>
              <option value="3">L (Litro)</option>
              <option value="4">mL (Mililitro)</option>
              <option value="5">unidad</option>
              <option value="6">caja</option>
              <option value="7">galón</option>
              <option value="8">barril</option>
            </select>
          </div>

          <div class="form-group">
            <label for="densidad">Densidad (g/cm³ o kg/L)</label>
            <input 
              id="densidad"
              v-model.number="form.densidad" 
              type="number" 
              step="0.001"
              min="0"
              placeholder="ej: 1.84"
            />
            <small>Densidad del material (opcional)</small>
          </div>

          <div class="form-group">
            <label for="stock_minimo">Stock Mínimo</label>
            <input 
              id="stock_minimo"
              v-model.number="form.stock_minimo" 
              type="number" 
              min="0"
              step="1"
              placeholder="0"
            />
            <small>Cantidad mínima requerida en inventario (número entero)</small>
          </div>

          <div class="form-group">
            <label for="stock_maximo">Stock Máximo</label>
            <input 
              id="stock_maximo"
              v-model.number="form.stock_maximo" 
              type="number" 
              min="0"
              step="1"
              placeholder="Opcional"
            />
            <small>Límite superior de inventario (opcional, número entero)</small>
          </div>
        </form>
      </div>
    </div>

    <Notification 
      v-if="showNotification"
      :type="notificationType"
      :message="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import Notification from '../components/Notification.vue'
import '../assets/styles/MateriasPrimas.css'
import materiasPrimasService from '../services/materiasPrimasService'

export default {
  name: 'MateriaPrimaCreateView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, Notification },
  
  data() {
    return {
      form: {
        codigo: '',
        nombre: '',
        descripcion: '',
        unidad_id: '',
        densidad: null,
        stock_minimo: 0,
        stock_maximo: null,
      },
      isEdit: false,
      editId: null,
      error: '',
      showNotification: false,
      notificationType: 'success',
      notificationMessage: '',
    }
  },

  created() {
    const editId = this.$route.query.edit
    if (editId) {
      this.isEdit = true
      this.editId = editId
      this.loadMateriaPrima(editId)
    }
  },

  methods: {
    async loadMateriaPrima(id) {
      try {
        const data = await materiasPrimasService.getMateriaPrima(id)
        this.form = {
          codigo: data.codigo || '',
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          unidad_id: data.unidad_id || '',
          densidad: data.densidad || null,
          stock_minimo: data.stock_minimo || 0,
          stock_maximo: data.stock_maximo || null,
        }
      } catch (e) {
        console.error('Error al cargar materia prima', e)
        this.error = 'No se pudo cargar la materia prima.'
      }
    },

    async save() {
      this.error = ''
      
      // Validación básica
      if (!this.form.codigo || !this.form.nombre || !this.form.unidad_id) {
        this.error = 'Por favor complete todos los campos requeridos.'
        return
      }

      try {
        // Preparar datos (eliminar valores null opcionales)
        const payload = {
          codigo: this.form.codigo,
          nombre: this.form.nombre,
          descripcion: this.form.descripcion || '',
          unidad_id: parseInt(this.form.unidad_id),
          stock_minimo: parseInt(this.form.stock_minimo) || 0,
        }

        if (this.form.densidad !== null && this.form.densidad !== '') {
          payload.densidad = parseFloat(this.form.densidad)
        }

        if (this.form.stock_maximo !== null && this.form.stock_maximo !== '') {
          payload.stock_maximo = parseInt(this.form.stock_maximo)
        }

        if (this.isEdit) {
          await materiasPrimasService.updateMateriaPrima(this.editId, payload)
          this.showNotificationMsg('success', 'Materia prima actualizada correctamente')
        } else {
          await materiasPrimasService.createMateriaPrima(payload)
          this.showNotificationMsg('success', 'Materia prima creada correctamente')
          this.resetForm()
        }
      } catch (e) {
        console.error('Error al guardar materia prima', e)
        const errorMsg = e.response?.data?.message || 'No se pudo guardar la materia prima.'
        this.showNotificationMsg('error', errorMsg)
      }
    },

    resetForm() {
      this.form = {
        codigo: '',
        nombre: '',
        descripcion: '',
        unidad_id: '',
        densidad: null,
        stock_minimo: 0,
        stock_maximo: null,
      }
      this.error = ''
      
      // Poner focus en el primer campo
      this.$nextTick(() => {
        const firstInput = document.querySelector('#codigo')
        if (firstInput) {
          firstInput.focus()
        }
      })
    },

    showNotificationMsg(type, message) {
      this.notificationType = type
      this.notificationMessage = message
      this.showNotification = true
    }
  }
}
</script>
