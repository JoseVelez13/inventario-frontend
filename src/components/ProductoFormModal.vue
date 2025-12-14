<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="product_code">Código</label>
                <input id="product_code" v-model="form.product_code" maxlength="50" />
              </div>

              <div class="form-field">
                <label for="name">Nombre</label>
                <input id="name" v-model="form.name" maxlength="150" />
              </div>

              <div class="form-field full">
                <label for="description">Descripción</label>
                <textarea id="description" v-model="form.description"></textarea>
              </div>

              <div class="form-field">
                <label for="unit">Unidad</label>
                <select id="unit" v-model.number="form.unit">
                  <option v-for="u in unidades" :key="u.id" :value="u.id">{{ u.nombre }} ({{ u.simbolo }})</option>
                </select>
              </div>

              <div class="form-field">
                <label for="weight">Peso (kg)</label>
                <input id="weight" v-model.number="form.weight" type="number" step="0.001" min="0" />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary">{{ isEdit ? 'Actualizar' : 'Crear' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import productosService from '../services/productosService'

const props = defineProps({
  show: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)
const unidades = ref([])

const form = reactive({
  product_code: '',
  name: '',
  description: '',
  unit: null,
  weight: 0.0
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.editId, (id) => { if (id) loadProducto(id) })

function resetForm() {
  form.product_code = ''
  form.name = ''
  form.description = ''
  form.unit = null
  form.weight = 0.0
  isEdit.value = false
}

async function loadUnidades() {
  try {
    const token = localStorage.getItem('access_token')
    const res = await fetch('http://localhost:8000/api/unidades/', {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    unidades.value = Array.isArray(data) ? data : data.results || []
  } catch (e) {
    console.error('Error cargando unidades', e)
  }
}

async function loadProducto(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await productosService.getProducto(id)
    form.product_code = data.product_code || ''
    form.name = data.name || ''
    form.description = data.description || ''
    form.unit = data.unit || null
    form.weight = data.weight || 0.0
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando producto', e)
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  resetForm()
  emit('close')
}

async function submit() {
  try {
    const payload = {
      product_code: form.product_code,
      name: form.name,
      description: form.description || null,
      unit: form.unit || 1,
      weight: form.weight || 0
    }

    if (props.editId) {
      await productosService.updateProducto(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await productosService.createProducto(payload)
      emit('saved', { action: 'created' })
    }

    close()
  } catch (e) {
    console.error('Error guardando producto', e)
  }
}

loadUnidades()
</script>

<style scoped>
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:10000 }
.form-modal { max-width:820px; width:96%; background:#fff; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.2); overflow:hidden }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid #eee; background:#fafafa }
.content { padding:20px }
.form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px }
.form-grid .full { grid-column:1 / -1 }
.form-field label { font-weight:600; margin-bottom:6px; display:block }
.form-field input, .form-field textarea, .form-field select { width:100%; padding:10px; border:1px solid #ddd; border-radius:8px }
.form-actions { padding:12px 20px; border-top:1px solid #eee; display:flex; justify-content:center }
.btn-primary { padding:8px 20px; background:#4f6f8f; color:#fff; border:none; border-radius:8px }
.btn-icon { color:#ef4444; cursor:pointer; border:none; background:transparent; font-size:18px; padding:4px 8px; border-radius:6px; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center }
.btn-icon:hover { background:#fee2e2; color:#dc2626 }
@media (max-width:720px){ .form-grid{grid-template-columns:1fr} .form-modal{width:98%} }
</style>
