<template>
  <div class="welcome-container">
    <HeaderComponent />
    <div class="fondo"></div>

    <div class="welcome-box">
      <h2 class="title">Bienvenido al gestor de inventario</h2>
      <p class="subtitle_inicio">Para continuar, inicie sesión</p>

      <button class="btn-login" @click="$router.push('/login')">
        Iniciar Sesión
      </button>
    </div>

  </div>
  
</template>

<script>
  import '../assets/styles/InicioView.css'
  import '../router/index.js'
  import HeaderComponent from '../components/HeaderInicio.vue';
    export default {
      name: 'InicioView',
      components: {
      HeaderComponent
                  },   
    }
</script>
