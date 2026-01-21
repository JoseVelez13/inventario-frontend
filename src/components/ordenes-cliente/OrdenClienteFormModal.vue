<template>
  <div v-if="visible" class="modal-overlay" @click="closeIfOutside">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEdit ? 'Editar Orden' : 'Nueva Orden' }}</h2>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="submit" class="form-grid">
          <div class="form-field">
            <label for="order_code">Código de Orden *</label>
            <input 
              id="order_code" 
              v-model="form.order_code" 
              type="text"
              maxlength="50"
              placeholder="Ej: ORD-001-2025"
              required
            />
            <small class="help-text">Identificador único de la orden</small>
          </div>

          <div class="form-field">
            <label for="client">Cliente *</label>
            <select v-model="form.client" id="client" required>
              <option :value="null">-- Selecciona un cliente --</option>
              <option v-for="cli in clientes" :key="cli.id" :value="cli.id">
                {{ cli.nombre_empresa }} ({{ cli.ruc }})
              </option>
            </select>
            <small class="help-text">Cliente que realiza la orden</small>
          </div>

          <div class="form-field">
            <label for="order_date">Fecha de Orden *</label>
            <input 
              id="order_date" 
              v-model="form.order_date" 
              type="date"
              required
            />
            <small class="help-text">Fecha en que se realizó la orden</small>
          </div>

          <div class="form-field">
            <label for="tax_rate">Tasa de Impuesto (%) - Opcional</label>
            <input 
              id="tax_rate" 
              v-model.number="form.tax_rate" 
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
            />
            <small class="help-text">Porcentaje de impuesto (0-100%)</small>
          </div>

          <div class="form-field full">
            <label for="notes">Notas / Observaciones</label>
            <textarea 
              id="notes" 
              v-model="form.notes" 
              rows="3"
              placeholder="Notas adicionales sobre la orden..."
            ></textarea>
            <small class="help-text">Información adicional (opcional)</small>
          </div>

          <div v-if="isEdit" class="alert-info full">
            <i class="fa-solid fa-info-circle"></i>
            Editando orden existente. Los montos totales se calculan automáticamente desde los items.
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="close">Cancelar</button>
        <button 
          class="btn-primary" 
          @click="submit"
          :disabled="loading || !form.order_code || form.client === null"
        >
          <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i>
          {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getOrdenCliente,
  createOrdenCliente,
  updateOrdenCliente
} from '../../services/ordenClienteService'
import clientesService from '../../services/clientesService'

export default {
  name: 'OrdenClienteFormModal',
  props: {
    show: { type: Boolean, default: false },
    editId: { type: [String, Number], default: null }
  },
  emits: ['close', 'saved'],
  data() {
    return {
      visible: this.show,
      isEdit: false,
      loading: false,
      clientes: [],
      form: {
        order_code: '',
        client: null,
        order_date: new Date().toISOString().split('T')[0],
        tax_rate: 0,
        notes: ''
      }
    }
  },

  watch: {
    show(v) {
      this.visible = v
      if (v && this.editId) {
        this.loadOrden(this.editId)
      } else if (v) {
        this.resetForm()
      }
    },
    editId(id) {
      if (id && this.visible) {
        this.loadOrden(id)
      }
    }
  },

  mounted() {
    this.loadClientes()
  },

  methods: {
    resetForm() {
      this.form.order_code = ''
      this.form.client = null
      this.form.order_date = new Date().toISOString().split('T')[0]
      this.form.tax_rate = 0
      this.form.notes = ''
      this.isEdit = false
    },

    async loadClientes() {
      try {
        const response = await clientesService.getClientes(1, 1000)
        this.clientes = response.results || (Array.isArray(response) ? response : [])
      } catch (err) {
        console.error('Error cargando clientes:', err)
      }
    },

    async loadOrden(id) {
      try {
        const data = await getOrdenCliente(id)
        this.form.order_code = data.order_code
        this.form.client = data.client
        this.form.order_date = data.order_date
        this.form.tax_rate = data.tax_rate || 0
        this.form.notes = data.notes || ''
        this.isEdit = true
      } catch (err) {
        console.error('Error cargando orden:', err)
      }
    },

    async submit() {
      try {
        this.loading = true
        
        // Construir payload - client debe ser un NUMBER (ID del cliente)
        const payload = {
          order_code: String(this.form.order_code).trim(),
          client: Number(this.form.client), // ID numérico del cliente
          order_date: String(this.form.order_date),
          tax_rate: Number(this.form.tax_rate) || 0,
          notes: String(this.form.notes || '').trim()
        }
        
        console.log('Payload enviado:', payload)
        console.log('Client ID:', payload.client, '- Tipo:', typeof payload.client)
        
        if (this.isEdit) {
          await updateOrdenCliente(this.editId, payload)
        } else {
          await createOrdenCliente(payload)
        }

        this.$emit('saved')
        this.close()
      } catch (err) {
        console.error('Error completo:', err)
        console.error('Respuesta:', err.response?.data)
        alert('Error al guardar la orden: ' + (err.detail || err.message || JSON.stringify(err.response?.data) || 'Error desconocido'))
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
