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
              <input id="ruc" v-model="form.ruc" maxlength="13" required />
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

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="reset">Limpiar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Tooltip from '../components/Tooltip.vue'
import '../assets/styles/Clientes.css'
import clientesService from '../services/clientesService.js'

export default {
  name: 'ClienteCreateView',
  components: { HeaderGlobal, Breadcrumbs, Tooltip },

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
        alert('No se pudo cargar el cliente a editar')
      }
    },

    reset() {
      this.form = {
        ruc: '',
        nombre_empresa: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        direccion: '',
      }
    },

    async submit() {
  try {
    if (this.isEdit) {
      await clientesService.updateCliente(this.idEdit, this.form)
      alert('Cliente actualizado correctamente')
    } else {
      await clientesService.createCliente(this.form)
      alert('Cliente creado correctamente')
    }
    this.$router.push('/clientes')
  } catch (e) {
    // 👀 Mostrar detalle del error que manda el backend
    console.error('Error al guardar cliente', e.response?.data || e)
    alert('No se pudo guardar el cliente')
  }
}

  }
}
</script>
