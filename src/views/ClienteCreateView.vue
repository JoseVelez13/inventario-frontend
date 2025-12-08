<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />
    <div class="bg-fondo-clientes"></div>

    <div class="topbar">
      <div class="topbar-title">Nuevo Cliente</div>
      <div class="topbar-actions">
        <Tooltip text="Cancelar y volver a la lista">
          <button class="btn-secondary" @click="$router.push('/clientes')">Cancelar</button>
        </Tooltip>
        <Tooltip text="Limpiar todos los campos">
          <button class="btn-secondary" @click="reset">Limpiar</button>
        </Tooltip>
        <Tooltip text="Guardar el cliente">
          <button class="btn-primary" @click="submit">Guardar</button>
        </Tooltip>
      </div>
    </div>

    <div class="content-box">
      <div class="content-body">
        <form @submit.prevent="submit">
          <div class="form-grid">
            <div class="form-field">
              <label for="ruc">RUC</label>
              <input id="ruc" ref="rucInput" v-model="form.ruc" maxlength="13" required />
            </div>

            <div class="form-field">
              <label for="nombre_empresa">Nombre de la Empresa</label>
              <input id="nombre_empresa" v-model="form.nombre_empresa" maxlength="100" required />
            </div>

            <div class="form-field">
              <label for="nombre_contacto">Nombre del Contacto</label>
              <input id="nombre_contacto" v-model="form.nombre_contacto" maxlength="100" />
            </div>

            <div class="form-field">
              <label for="telefono">Teléfono</label>
              <input id="telefono" v-model="form.telefono" maxlength="24" />
            </div>

            <div class="form-field full">
              <label for="email">Correo Electrónico</label>
              <input id="email" type="email" v-model="form.email" maxlength="100" required />
            </div>

            <div class="form-field full">
              <label for="direccion">Dirección</label>
              <textarea id="direccion" v-model="form.direccion" required></textarea>
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
import '../assets/styles/Clientes.css'
import clientesService from '../services/clientesService.js'

export default {
  name: 'ClienteCreateView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip, Notification },

  data() {
    return {
      form: {
        ruc: '',
        nombre_empresa: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        direccion: '',
      },
      isEdit: false,
      idEdit: null,
      notification: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      },
    }
  },

  created() {
    const editParam = this.$route.query.edit
    if (editParam) {
      this.isEdit = true
      this.idEdit = editParam
      this.fetchCliente(editParam)
    }
  },

  methods: {
    async fetchCliente(id) {
      try {
        const data = await clientesService.getCliente(id)
        this.form = {
          ruc: data.ruc || '',
          nombre_empresa: data.nombre_empresa || '',
          nombre_contacto: data.nombre_contacto || '',
          telefono: data.telefono || '',
          email: data.email || '',
          direccion: data.direccion || '',
        }
      } catch (e) {
        console.error('No se pudo cargar el cliente', e)
        this.showNotification('error', 'Error', 'No se pudo cargar el cliente a editar')
      }
    },

    reset() {
      // Limpiar el formulario
      this.form = {
        ruc: '',
        nombre_empresa: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        direccion: '',
      }
      
      // Aplicar focus al campo RUC después de limpiar con un pequeño delay
      setTimeout(() => {
        const rucInput = document.querySelector('#ruc')
        if (rucInput) {
          rucInput.focus()
          rucInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    },

    async submit() {
  try {
    if (this.isEdit) {
      await clientesService.updateCliente(this.idEdit, this.form)
      this.showNotification('success', '¡Éxito!', 'Cliente actualizado correctamente')
      setTimeout(() => this.$router.push('/clientes'), 1500)
    } else {
      await clientesService.createCliente(this.form)
      this.showNotification('success', '¡Éxito!', 'Cliente creado correctamente')
      setTimeout(() => this.$router.push('/clientes'), 1500)
    }
  } catch (e) {
    console.error('Error al guardar cliente', e.response?.data || e)
    this.showNotification('error', 'Error', 'No se pudo guardar el cliente')
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
