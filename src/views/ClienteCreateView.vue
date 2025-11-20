<template>
  <div class="page-container">
    <HeaderComponent />
    <div class="bg-fondo-clientes"></div>

    <div class="topbar">
      <div class="topbar-title">Nuevo Cliente</div>
      <div class="topbar-actions">
        <button class="btn-secondary" @click="$router.push('/clientes')">Cancelar</button>
        <button class="btn-primary" @click="submit">Guardar</button>
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
import HeaderComponent from '../components/HeaderInicio.vue'
import '../assets/styles/Clientes.css'

export default {
  name: 'ClienteCreateView',
  components: { HeaderComponent },
  data() {
    return {
      form: {
        ruc: '',
        nombre_empresa: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        direccion: '',
      }
    }
  },
  methods: {
    reset() {
      this.form = { ruc: '', nombre_empresa: '', nombre_contacto: '', telefono: '', email: '', direccion: '' }
    },
    submit() {
      // Simulación de guardado (sin backend todavía)
      console.log('Cliente a guardar:', this.form)
      alert('Cliente guardado (mock). Cuando el backend esté listo, se enviará al API.')
      this.$router.push('/clientes')
    }
  }
}
</script>
