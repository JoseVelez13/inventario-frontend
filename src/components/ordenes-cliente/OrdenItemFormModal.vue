<template>
  <div v-if="visible" class="modal-overlay" @click="closeIfOutside">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? 'Editar Item' : 'Agregar Item' }}</h2>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submit" class="form-grid">
          <div class="form-field">
            <label for="producto">Producto *</label>
            <select 
              id="producto" 
              v-model.number="form.product" 
              required
              @change="updateProductInfo"
            >
              <option :value="null">-- Selecciona un producto --</option>
              <option v-for="prod in productos" :key="prod.id" :value="prod.id">
                {{ prod.nombre }} ({{ prod.codigo }})
              </option>
            </select>
            <small class="help-text">Producto a incluir en la orden</small>
          </div>

          <div class="form-field">
            <label for="quantity">Cantidad *</label>
            <input 
              id="quantity" 
              v-model.number="form.quantity" 
              type="number"
              min="1"
              step="1"
              placeholder="1"
              required
            />
            <small class="help-text">Cantidad del producto</small>
          </div>

          <div class="form-field">
            <label for="unit_price">Precio Unitario ($) *</label>
            <input 
              id="unit_price" 
              v-model.number="form.unit_price" 
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
            <small class="help-text">Precio unitario del producto</small>
          </div>

          <div class="form-field full">
            <label for="observaciones">Observaciones / Notas</label>
            <textarea 
              id="observaciones" 
              v-model="form.observaciones" 
              rows="3"
              placeholder="Anotaciones sobre este item..."
            ></textarea>
            <small class="help-text">Notas adicionales del item (opcional)</small>
          </div>

          <div v-if="isEdit" class="alert-info full">
            <i class="fa-solid fa-info-circle"></i>
            Editando item existente. Los cambios se aplicarán a la orden.
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Cancelar</button>
        <button 
          class="btn-primary" 
          @click="submit"
          :disabled="loading || !form.product || !form.quantity || form.unit_price === null"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Agregar') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as ordenClienteService from '../../services/ordenClienteService'
import productosService from '../../services/productosService'

export default {
  name: 'OrdenItemFormModal',
  props: {
    show: { type: Boolean, default: false },
    editId: { type: [String, Number], default: null },
    ordenId: { type: [String, Number], required: true }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      visible: this.show,
      isEdit: false,
      loading: false,
      productos: [],
      form: {
        product: null,
        quantity: 1,
        unit_price: null,
        observaciones: ''
      }
    }
  },

  watch: {
    show(v) {
      this.visible = v
      if (v && this.editId) {
        this.loadItem(this.editId)
      } else if (v) {
        this.resetForm()
      }
    },
    editId(id) {
      if (id && this.visible) {
        this.loadItem(id)
      }
    }
  },

  mounted() {
    this.loadProductos()
  },

  methods: {
    resetForm() {
      this.form = {
        product: null,
        quantity: 1,
        unit_price: null,
        observaciones: ''
      }
      this.isEdit = false
    },

    async loadProductos() {
      try {
        const response = await productosService.getProductos(1, 1000)
        this.productos = response.results || (Array.isArray(response) ? response : [])
      } catch (err) {
        console.error('Error cargando productos:', err)
      }
    },

    updateProductInfo() {
      if (this.form.product) {
        const prod = this.productos.find(p => p.id === this.form.product)
        if (prod && prod.unit_price) {
          this.form.unit_price = prod.unit_price
        }
      }
    },

    async loadItem(id) {
      try {
        const data = await ordenClienteService.getOrdenItem(id)
        this.form.product = data.product
        this.form.quantity = data.quantity
        this.form.unit_price = data.unit_price
        this.form.observaciones = data.observaciones || ''
        this.isEdit = true
      } catch (err) {
        console.error('Error cargando item:', err)
      }
    },

    async submit() {
      try {
        this.loading = true
        
        if (this.isEdit) {
          await ordenClienteService.updateOrdenItem(this.editId, this.form)
        } else {
          this.form.orden = this.ordenId
          await ordenClienteService.createOrdenItem(this.form)
        }

        this.$emit('saved')
        this.close()
      } catch (err) {
        console.error('Error:', err)
        alert('Error al guardar el item: ' + (err.detail || err.message || 'Error desconocido'))
      } finally {
        this.loading = false
      }
    },

    close() {
      this.visible = false
      this.$emit('close')
      this.resetForm()
    },

    closeIfOutside(e) {
      if (e.target === e.currentTarget) {
        this.close()
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #F3F4F6;
  color: #1F2937;
}

.modal-body {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 500;
  font-size: 14px;
  color: #374151;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  color: #1F2937;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.help-text {
  font-size: 12px;
  color: #9CA3AF;
}

.alert-info {
  background: #DBEAFE;
  border-left: 4px solid #0284C7;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #0C4A6E;
  display: flex;
  gap: 8px;
}

.alert-info i {
  flex-shrink: 0;
  margin-top: 2px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #3B82F6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563EB;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #E5E7EB;
  color: #374151;
}

.btn-secondary:hover {
  background: #D1D5DB;
}
</style>
