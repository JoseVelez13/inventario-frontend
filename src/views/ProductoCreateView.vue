<template>
  <div class="page-container">
    <HeaderGlobal />
    <Breadcrumbs />

    <div class="content-box">
      <div class="content-body">
        <h3>Vista obsoleta</h3>
        <p>La creación/edición de productos ahora se realiza mediante el modal en la vista de Productos. Este archivo permanece solo por compatibilidad y puede ser eliminado si todo funciona correctamente.</p>
        <p>
          Usa la lista de productos y el botón "Nuevo" para abrir el formulario en ventana flotante.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Breadcrumbs from '../components/Breadcrumbs.vue'

export default {
  name: 'ProductoCreateView',
  components: { HeaderGlobal, Breadcrumbs }
}
</script>
