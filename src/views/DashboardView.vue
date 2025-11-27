<template>
  <div class="dashboard-page">
    <HeaderGlobal />
    <div class="dashboard-bg"></div>

    <div class="dashboard-wrapper">
      <div class="dashboard-top">
        <h1 class="dash-title">Aplicaciones</h1>
      </div>

      <div class="modules-grid">
        <div class="module-card" @click="$router.push('/clientes')" role="button" tabindex="0">
          <div class="module-icon">👥</div>
          <div class="module-info">
            <h3>Clientes</h3>
            <p>Gestión de empresas y contactos</p>
          </div>
          <div class="module-badge active">Activo</div>
        </div>

        <div class="module-card disabled" role="button" tabindex="-1" aria-disabled="true">
          <div class="module-icon">📦</div>
          <div class="module-info">
            <h3>Productos</h3>
            <p>Control de inventario</p>
          </div>
          <div class="module-badge">Próximamente</div>
        </div>

        <div class="module-card disabled" role="button" tabindex="-1" aria-disabled="true">
          <div class="module-icon">🧪</div>
          <div class="module-info">
            <h3>Materia Prima</h3>
            <p>Gestión de insumos</p>
          </div>
          <div class="module-badge">Próximamente</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import '../assets/styles/Dashboard.css'
</script>
