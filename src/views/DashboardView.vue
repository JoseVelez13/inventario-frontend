<template>
  <div class="dashboard-page">
    <HeaderGlobal />
    <div class="dashboard-bg"></div>

    <div class="dashboard-wrapper">
      <div class="dashboard-top">
        <h1 class="dash-title">Aplicaciones</h1>
      </div>

      <div class="modules-grid">
        <Tooltip text="Ir al módulo de Clientes" position="bottom">
          <div class="module-card" @click="$router.push('/clientes')" role="button" tabindex="0">
            <div class="module-icon">👥</div>
            <div class="module-info">
              <h3>Clientes</h3>
              <p>Gestión de empresas y contactos</p>
            </div>
            <div class="module-badge active">Activo</div>
          </div>
        </Tooltip>

        <Tooltip text="Ir al módulo de Productos" position="bottom">
          <div class="module-card" @click="$router.push('/productos')" role="button" tabindex="0">
            <div class="module-icon">📦</div>
            <div class="module-info">
              <h3>Productos</h3>
              <p>Control de inventario</p>
            </div>
            <div class="module-badge active">Activo</div>
          </div>
        </Tooltip>

        <Tooltip text="Ir al módulo de Materias Primas" position="bottom">
          <div class="module-card" @click="$router.push('/materias-primas')" role="button" tabindex="0">
            <div class="module-icon">🧪</div>
            <div class="module-info">
              <h3>Materia Prima</h3>
              <p>Gestión de insumos</p>
            </div>
            <div class="module-badge active">Activo</div>
          </div>
        </Tooltip>

        <Tooltip text="Ir al módulo de Lotes de Producción" position="bottom">
          <div class="module-card" @click="$router.push('/lotes-produccion')" role="button" tabindex="0">
            <div class="module-icon">⚙️</div>
            <div class="module-info">
              <h3>Lotes de Producción</h3>
              <p>Gestión de producción</p>
            </div>
            <div class="module-badge active">Activo</div>
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeaderGlobal from '../components/HeaderGlobal.vue'
import Tooltip from '../components/Tooltip.vue'
import '../assets/styles/Dashboard.css'
</script>
