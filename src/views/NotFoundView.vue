<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <!-- Animación 404 -->
      <div class="error-animation">
        <div class="error-code animate__animated animate__bounceIn">
          <span class="digit">4</span>
          <span class="digit middle">0</span>
          <span class="digit">4</span>
        </div>
        <div class="floating-icons">
          <i class="fa-solid fa-box icon-1"></i>
          <i class="fa-solid fa-exclamation-triangle icon-2"></i>
          <i class="fa-solid fa-question-circle icon-3"></i>
        </div>
      </div>

      <!-- Contenido -->
      <div class="error-content animate__animated animate__fadeInUp animate__delay-1s">
        <h1>¡Oops! Página no encontrada</h1>
        <p>Parece que te has perdido en el inventario. La página que buscas no existe o fue movida.</p>
        
        <div class="error-suggestions">
          <h3>¿Qué puedes hacer?</h3>
          <ul>
            <li>
              <i class="fa-solid fa-arrow-left"></i>
              Volver a la página anterior
            </li>
            <li>
              <i class="fa-solid fa-home"></i>
              Ir al inicio del sistema
            </li>
            <li>
              <i class="fa-solid fa-search"></i>
              Buscar lo que necesitas
            </li>
          </ul>
        </div>

        <div class="error-actions">
          <button class="btn-primary" @click="goHome">
            <i class="fa-solid fa-home"></i>
            Ir al Inicio
          </button>
          <button class="btn-secondary" @click="goBack">
            <i class="fa-solid fa-arrow-left"></i>
            Volver Atrás
          </button>
          <button class="btn-secondary" @click="goToDashboard">
            <i class="fa-solid fa-gauge"></i>
            Dashboard
          </button>
        </div>
      </div>

      <!-- Decoración de fondo -->
      <div class="background-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.not-found-container {
  max-width: 800px;
  text-align: center;
  position: relative;
  z-index: 2;
}

/* Animación 404 */
.error-animation {
  position: relative;
  margin-bottom: 3rem;
}

.error-code {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.digit {
  font-size: 8rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

.digit.middle {
  animation-delay: 0.2s;
  color: #ffd700;
  transform: scale(1.2);
}

.digit:first-child {
  animation-delay: 0s;
}

.digit:last-child {
  animation-delay: 0.4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

/* Iconos flotantes */
.floating-icons {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-icons i {
  position: absolute;
  color: rgba(255, 255, 255, 0.4);
  font-size: 3rem;
  animation: floatAround 4s ease-in-out infinite;
}

.icon-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.icon-2 {
  top: 50%;
  right: 15%;
  animation-delay: 1s;
}

.icon-3 {
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

@keyframes floatAround {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -10px) rotate(5deg);
  }
  50% {
    transform: translate(-5px, 10px) rotate(-5deg);
  }
  75% {
    transform: translate(15px, 5px) rotate(3deg);
  }
}

/* Contenido */
.error-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.error-content h1 {
  font-size: 2.5rem;
  color: #374151;
  margin: 0 0 1rem 0;
  font-weight: 700;
}

.error-content > p {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.error-suggestions {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.error-suggestions h3 {
  font-size: 1.125rem;
  color: #374151;
  margin: 0 0 1rem 0;
}

.error-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.error-suggestions li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #6b7280;
  font-size: 0.9375rem;
}

.error-suggestions li i {
  color: #667eea;
  font-size: 1rem;
}

/* Botones */
.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.error-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

/* Decoración de fondo */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: pulse 4s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: 10%;
  animation-delay: 1s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  right: -50px;
  animation-delay: 2s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .digit {
    font-size: 5rem;
  }

  .error-content {
    padding: 2rem 1.5rem;
  }

  .error-content h1 {
    font-size: 1.75rem;
  }

  .error-content > p {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
  }

  .error-actions button {
    width: 100%;
  }

  .floating-icons i {
    font-size: 2rem;
  }
}
</style>
