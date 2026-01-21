<template>
  <div class="welcome-container">
    <HeaderComponent />
    
    <!-- Hero Section Mejorado -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-content animate__animated animate__fadeIn">
        <div class="hero-badge animate__animated animate__fadeInDown">
          <span class="badge-icon">✨</span>
          <span>Sistema de Gestión Empresarial</span>
        </div>
        
        <h1 class="hero-title animate__animated animate__fadeInUp">
          Gestiona tu <span class="gradient-text">Inventario</span><br>
          de manera <span class="gradient-text">Inteligente</span>
        </h1>
        
        <p class="hero-subtitle animate__animated animate__fadeInUp animate__delay-1s">
          Controla productos, clientes, materias primas y lotes de producción<br>
          desde una plataforma moderna y fácil de usar
        </p>
        
        <div class="hero-actions animate__animated animate__fadeInUp animate__delay-2s">
          <button class="btn-hero-primary" @click="$router.push('/login')">
            <i class="fa-solid fa-rocket"></i>
            Comenzar Ahora
          </button>
          <button class="btn-hero-secondary" @click="scrollToFeatures">
            <i class="fa-solid fa-info-circle"></i>
            Ver Características
          </button>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="hero-stats animate__animated animate__fadeInUp animate__delay-3s">
          <div class="stat-item">
            <i class="fa-solid fa-box"></i>
            <div class="stat-info">
              <span class="stat-number">∞</span>
              <span class="stat-label">Productos</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fa-solid fa-users"></i>
            <div class="stat-info">
              <span class="stat-number">∞</span>
              <span class="stat-label">Clientes</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fa-solid fa-chart-line"></i>
            <div class="stat-info">
              <span class="stat-number">24/7</span>
              <span class="stat-label">Disponibilidad</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section" ref="featuresSection">
      <div class="features-header animate__animated animate__fadeInUp">
        <h2>Funcionalidades Principales</h2>
        <p>Todo lo que necesitas para gestionar tu inventario en un solo lugar</p>
      </div>

      <div class="features-grid">
        <div class="feature-card animate__animated animate__fadeInUp" style="animation-delay: 0.1s">
          <div class="feature-icon productos">
            <i class="fa-solid fa-box"></i>
          </div>
          <h3>Gestión de Productos</h3>
          <p>Control total de tu inventario con alertas de stock bajo y reportes detallados</p>
          <ul class="feature-list">
            <li><i class="fa-solid fa-check"></i> Control de stock en tiempo real</li>
            <li><i class="fa-solid fa-check"></i> Alertas automáticas</li>
            <li><i class="fa-solid fa-check"></i> Reportes exportables</li>
          </ul>
        </div>

        <div class="feature-card animate__animated animate__fadeInUp" style="animation-delay: 0.2s">
          <div class="feature-icon clientes">
            <i class="fa-solid fa-users"></i>
          </div>
          <h3>Gestión de Clientes</h3>
          <p>Administra tu cartera de clientes y mantén un registro completo de interacciones</p>
          <ul class="feature-list">
            <li><i class="fa-solid fa-check"></i> Base de datos completa</li>
            <li><i class="fa-solid fa-check"></i> Historial de órdenes</li>
            <li><i class="fa-solid fa-check"></i> Seguimiento personalizado</li>
          </ul>
        </div>

        <div class="feature-card animate__animated animate__fadeInUp" style="animation-delay: 0.3s">
          <div class="feature-icon materias">
            <i class="fa-solid fa-flask"></i>
          </div>
          <h3>Materias Primas</h3>
          <p>Controla tus insumos y optimiza el proceso de producción</p>
          <ul class="feature-list">
            <li><i class="fa-solid fa-check"></i> Kardex automático</li>
            <li><i class="fa-solid fa-check"></i> Control de recepciones</li>
            <li><i class="fa-solid fa-check"></i> Trazabilidad completa</li>
          </ul>
        </div>

        <div class="feature-card animate__animated animate__fadeInUp" style="animation-delay: 0.4s">
          <div class="feature-icon lotes">
            <i class="fa-solid fa-industry"></i>
          </div>
          <h3>Lotes de Producción</h3>
          <p>Gestiona tu producción desde el inicio hasta el empaquetado final</p>
          <ul class="feature-list">
            <li><i class="fa-solid fa-check"></i> Seguimiento de lotes</li>
            <li><i class="fa-solid fa-check"></i> Control de calidad</li>
            <li><i class="fa-solid fa-check"></i> Reportes de producción</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- CTA Final -->
    <div class="cta-section animate__animated animate__fadeInUp">
      <h2>¿Listo para optimizar tu inventario?</h2>
      <p>Accede al sistema y comienza a gestionar de forma eficiente</p>
      <button class="btn-cta" @click="$router.push('/login')">
        <i class="fa-solid fa-sign-in-alt"></i>
        Iniciar Sesión
      </button>
    </div>
  </div>
</template>

<script>
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
      },
      methods: {
        scrollToFeatures() {
          this.$refs.featuresSection?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }
    }
</script>

<style scoped>
.welcome-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.hero-section {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  position: relative;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
  top: -100px;
  left: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.6) 0%, rgba(240, 147, 251, 0) 70%);
  bottom: 10%;
  right: 10%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(67, 233, 123, 0.5) 0%, rgba(67, 233, 123, 0) 70%);
  top: 40%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
  letter-spacing: -1px;
}

.gradient-text {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2.5rem 0;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
}

.btn-hero-primary, .btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-hero-primary {
  background: white;
  color: #667eea;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-hero-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.hero-stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.stat-item i { font-size: 2.5rem; opacity: 0.9; }
.stat-info { display: flex; flex-direction: column; align-items: flex-start; }
.stat-number { font-size: 2rem; font-weight: 700; }
.stat-label { font-size: 0.875rem; opacity: 0.8; text-transform: uppercase; }

.features-section {
  background: white;
  padding: 5rem 2rem;
  position: relative;
  z-index: 1;
}

.features-header { text-align: center; margin-bottom: 4rem; }
.features-header h2 { font-size: 2.5rem; font-weight: 700; color: #374151; margin: 0 0 1rem 0; }
.features-header p { font-size: 1.125rem; color: #6b7280; margin: 0; }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.feature-icon.productos { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.feature-icon.clientes { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
.feature-icon.materias { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
.feature-icon.lotes { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }

.feature-card h3 { font-size: 1.5rem; font-weight: 600; color: #374151; margin: 0 0 0.75rem 0; }
.feature-card > p { color: #6b7280; margin: 0 0 1.5rem 0; line-height: 1.6; }

.feature-list { list-style: none; padding: 0; margin: 0; }
.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}
.feature-list i { color: #10b981; font-size: 0.875rem; }

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 5rem 2rem;
  text-align: center;
  color: white;
}

.cta-section h2 { font-size: 2.5rem; font-weight: 700; margin: 0 0 1rem 0; }
.cta-section p { font-size: 1.125rem; opacity: 0.9; margin: 0 0 2rem 0; }

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .hero-subtitle { font-size: 1rem; }
  .hero-actions { flex-direction: column; }
  .btn-hero-primary, .btn-hero-secondary { width: 100%; justify-content: center; }
  .hero-stats { gap: 1.5rem; }
  .features-header h2 { font-size: 2rem; }
  .cta-section h2 { font-size: 2rem; }
}

/* Modo Oscuro */
:global(.dark-mode) .features-section {
  background: #1a1a2e;
}

:global(.dark-mode) .features-header h2 {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

:global(.dark-mode) .features-header p {
  color: #ffffff;
}

:global(.dark-mode) .feature-card {
  background: #2d2d44;
  border-color: #4d4d6c;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

:global(.dark-mode) .feature-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  border-color: #6d6d8c;
  background: #35355c;
}

:global(.dark-mode) .feature-card h3 {
  color: #ffffff;
}

:global(.dark-mode) .feature-card > p {
  color: #ffffff;
}

:global(.dark-mode) .feature-list li {
  color: #ffffff;
}
</style>
