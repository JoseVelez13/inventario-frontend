# ============================================
# Dockerfile para Frontend (Vue.js + Vite)
# Versión corregida
# ============================================

# ========== ETAPA 1: Construcción ==========
FROM node:20-alpine AS build

# Metadata
LABEL maintainer="Sistema Innoquim"
LABEL description="Frontend Vue.js + Vite - Sistema de Gestión de Inventario"

# Establecer directorio de trabajo
WORKDIR /app

# ⚠️ NO establecer NODE_ENV=production aquí (necesitamos devDependencies para el build)
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:8000/api}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT:-10000}

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# ✅ Instalar TODAS las dependencias (incluyendo devDependencies)
# --legacy-peer-deps por si hay conflictos de versiones
RUN npm ci --legacy-peer-deps

# Copiar el resto del código
COPY . .

# ✅ Ahora sí, construir para producción
RUN npm run build

# Verificar que dist existe
RUN ls -la /app/dist && echo "✅ Build exitoso"

# ========== ETAPA 2: Producción con Nginx ==========
FROM nginx:1.25-alpine

# Metadata
LABEL maintainer="Sistema Innoquim"

# Instalar curl para healthchecks
RUN apk add --no-cache curl

# Copiar archivos construidos
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración (OJO: No la copies aquí si la vas a montar con volumen en compose, 
# pero es buena práctica tenerla por si acaso)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🛠️ CORRECCIÓN CRÍTICA: Permisos
# 1. Crear el archivo PID vacío y darle permisos al usuario nginx
# 2. Dar permisos a la carpeta de caché y logs
# 3. Dar permisos al html (opcional, pero recomendado)
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

# Cambiar a usuario no-root
USER nginx

# ⚠️ CORRECCIÓN: Usar puerto > 1024
EXPOSE 8080

# Healthcheck (ajustado al puerto 8080)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
