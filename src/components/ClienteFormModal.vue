<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card form-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</h2>
          <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
        </div>

        <div class="content">
          <form @submit.prevent="submit">
            <div class="form-grid">
              <div class="form-field">
                <label for="ruc">RUC</label>
                <input id="ruc" v-model="form.ruc" maxlength="13" minlength="13" inputmode="numeric" placeholder="Ej: 1234567890001" />
              </div>

              <div class="form-field">
                <label for="nombre_empresa">Nombre de la Empresa</label>
                <input id="nombre_empresa" v-model="form.nombre_empresa" maxlength="100" />
              </div>

              <div class="form-field">
                <label for="nombre_contacto">Nombre del Contacto</label>
                <input id="nombre_contacto" v-model="form.nombre_contacto" maxlength="100" />
              </div>

              <div class="form-field">
                <label for="telefono">Teléfono</label>
                <input id="telefono" v-model="form.telefono" maxlength="24" inputmode="tel" />
              </div>

              <div class="form-field full">
                <label for="email">Correo Electrónico</label>
                <input id="email" type="email" v-model="form.email" maxlength="100" />
              </div>

              <div class="form-field full">
                <label for="direccion">Dirección</label>
                <textarea id="direccion" v-model="form.direccion"></textarea>
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
import clientesService from '../services/clientesService'

const props = defineProps({
  show: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)

const form = reactive({
  ruc: '',
  nombre_empresa: '',
  nombre_contacto: '',
  telefono: '',
  email: '',
  direccion: ''
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.editId, (id) => { if (id) loadCliente(id) })

function resetForm() {
  form.ruc = ''
  form.nombre_empresa = ''
  form.nombre_contacto = ''
  form.telefono = ''
  form.email = ''
  form.direccion = ''
}

async function loadCliente(id) {
  if (!id) return
  loading.value = true
  try {
    const data = await clientesService.getCliente(id)
    form.ruc = data.ruc || ''
    form.nombre_empresa = data.nombre_empresa || ''
    form.nombre_contacto = data.nombre_contacto || ''
    form.telefono = data.telefono || ''
    form.email = data.email || ''
    form.direccion = data.direccion || ''
    isEdit.value = true
  } catch (e) {
    console.error('Error cargando cliente para editar', e)
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  isEdit.value = false
  resetForm()
  emit('close')
}

async function submit() {
  try {
    const payload = {
      ruc: form.ruc,
      nombre_empresa: form.nombre_empresa,
      nombre_contacto: form.nombre_contacto || null,
      telefono: form.telefono || null,
      email: form.email,
      direccion: form.direccion
    }

    if (props.editId) {
      await clientesService.updateCliente(props.editId, payload)
      emit('saved', { action: 'updated' })
    } else {
      await clientesService.createCliente(payload)
      emit('saved', { action: 'created' })
    }

    close()
  } catch (e) {
    console.error('Error guardando cliente', e)
  }
}
</script>

<style scoped>
/* Basic modal styles (white card) */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:10000 }
.form-modal { max-width:820px; width:96%; background:#fff; border-radius:12px; box-shadow:0 20px 60px rgba(0,0,0,0.2); overflow:hidden }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid #eee; background:#fafafa }
.content { padding:20px }
.form-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px }
.form-grid .full { grid-column:1 / -1 }
.form-field label { font-weight:600; margin-bottom:6px; display:block }
.form-field input, .form-field textarea { width:100%; padding:10px; border:1px solid #ddd; border-radius:8px }
.form-actions { padding:12px 20px; border-top:1px solid #eee; display:flex; justify-content:center }
.btn-primary { padding:8px 20px; background:#4f6f8f; color:#fff; border:none; border-radius:8px }
.btn-icon { color:#ef4444; cursor:pointer; border:none; background:transparent; font-size:18px; padding:4px 8px; border-radius:6px; transition:all 0.2s ease; display:flex; align-items:center; justify-content:center }
.btn-icon:hover { background:#fee2e2; color:#dc2626 }
.btn-icon:active { transform:scale(0.95) }
@media (max-width:720px){ .form-grid{grid-template-columns:1fr} .form-modal{width:98%} }
</style>
