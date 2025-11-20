<template>
  <div class="dashboard-page">
    <HeaderGlobal />
    <div class="dashboard-bg"></div>

    <div class="dashboard-wrapper">
      <div class="dashboard-top">
        <h1 class="dash-title">Aplicaciones</h1>
      </div>

      <div class="modules-grid">
        <div class="module-card" @click="$router.push('/clientes')">
          <div class="module-icon">👥</div>
          <div class="module-info">
            <h3>Clientes</h3>
            <p>Gestione empresas y contactos</p>
          </div>
        </div>

        <div class="module-card disabled">
          <div class="module-icon">📦</div>
          <div class="module-info">
            <h3>Productos</h3>
            <p>Inventario de productos</p>
          </div>
        </div>

        <div class="module-card disabled">
          <div class="module-icon">🧪</div>
          <div class="module-info">
            <h3>Materia Prima</h3>
            <p>Gestionar insumos</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import '../assets/styles/Dashboard.css'
</script>
