<template>
  <div class="welcome-container">
    <HeaderComponent />
    <div class="fondo"></div>

    <div class="welcome-content">
      <div class="welcome-box">
        <h1 class="title">Sistema de Gestión Innoquim</h1>
        <p class="subtitle_inicio">Gestiona tu inventario, clientes y productos de manera eficiente</p>
        
        <button class="btn-login" @click="$router.push('/login')" aria-label="Ir a iniciar sesión">
          Acceder al sistema
        </button>
      </div>
    </div>

  </div>
  
</template>

<script>
  import '../assets/styles/InicioView.css'
  import '../router/index.js'
  import HeaderComponent from '../components/HeaderInicio.vue';
  import logo from '../assets/img/logo.png';
    export default {
      name: 'InicioView',
      components: {
      HeaderComponent
                  },
      data() {
        return {
          logo
        }
      }   
    }
</script>
