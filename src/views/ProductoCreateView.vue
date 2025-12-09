<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="topbar">
      <div class="topbar-title">{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</div>
      <div class="topbar-actions">
        <Tooltip text="Cancelar y volver a la lista">
          <button class="btn-secondary" @click="$router.push('/productos')">Cancelar</button>
        </Tooltip>
        <Tooltip text="Limpiar todos los campos">
          <button class="btn-secondary" @click="reset">Limpiar</button>
        </Tooltip>
        <Tooltip text="Guardar el producto">
          <button class="btn-primary" @click="submit">Guardar</button>
        </Tooltip>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <form @submit.prevent="submit">
          <div class="form-grid">
            <div class="form-field">
              <label for="product_code">Código del Producto</label>
              <input id="product_code" ref="codeInput" v-model="form.product_code" maxlength="50" required />
            </div>

            <div class="form-field">
              <label for="name">Nombre del Producto</label>
              <input id="name" v-model="form.name" maxlength="200" required />
            </div>

            <div class="form-field">
              <label for="unit">Unidad de Medida</label>
              <select id="unit" v-model="form.unit" required>
                <option value="">Seleccione...</option>
                <option value="kg">Kilogramo (kg)</option>
                <option value="g">Gramo (g)</option>
                <option value="L">Litro (L)</option>
                <option value="mL">Mililitro (mL)</option>
                <option value="unidad">Unidad</option>
                <option value="caja">Caja</option>
                <option value="galon">Galón</option>
                <option value="barril">Barril</option>
              </select>
            </div>

            <div class="form-field">
              <label for="weight">Peso (kg)</label>
              <input id="weight" type="number" step="0.01" v-model.number="form.weight" required />
            </div>

            <div class="form-field full">
              <label for="description">Descripción</label>
              <textarea id="description" v-model="form.description"></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>

    <Notification
      :show="notification.show"
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
import Notification from '../components/Notification.vue'
import '../assets/styles/Productos.css'
import productosService from '../services/productosService'

export default {
  name: 'ProductoCreateView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, Notification },

  data() {
    return {
      form: {
        product_code: '',
        name: '',
        description: '',
        unit: '',
        weight: 0,
      },
      isEdit: false,
      idEdit: null,
      notification: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      }
    }
  },

  created() {
    const editParam = this.$route.query.edit
    if (editParam) {
      this.isEdit = true
      this.idEdit = editParam
      this.fetchProducto(editParam)
    }
  },

  methods: {
    async fetchProducto(id) {
      try {
        const data = await productosService.getProducto(id)
        this.form = {
          product_code: data.product_code || '',
          name: data.name || '',
          description: data.description || '',
          unit: data.unit || '',
          weight: data.weight || 0,
        }
      } catch (e) {
        console.error('No se pudo cargar el producto', e)
        this.showNotification('error', 'Error', 'No se pudo cargar el producto a editar')
      }
    },

    reset() {
      this.form = {
        product_code: '',
        name: '',
        description: '',
        unit: '',
        weight: 0,
      }
      setTimeout(() => {
        const codeInput = document.querySelector('#product_code')
        if (codeInput) {
          codeInput.focus()
          codeInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    },

    async submit() {
      try {
        if (this.isEdit) {
          await productosService.updateProducto(this.idEdit, this.form)
          this.showNotification('success', '¡Éxito!', 'Producto actualizado correctamente')
          setTimeout(() => this.$router.push('/productos'), 1500)
        } else {
          await productosService.createProducto(this.form)
          this.showNotification('success', '¡Éxito!', 'Producto creado correctamente')
          setTimeout(() => this.$router.push('/productos'), 1500)
        }
      } catch (e) {
        console.error('Error al guardar producto', e.response?.data || e)
        this.showNotification('error', 'Error', 'No se pudo guardar el producto')
      }
    },

    showNotification(type, title, message) {
      this.notification = {
        show: true,
        type,
        title,
        message
      }
    }
  }
}
</script>
