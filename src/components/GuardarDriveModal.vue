<template>
    <div v-if="isOpen" class="modal-overlay" @click="cerrar">
        <div class="modal-container" @click.stop>
            <div class="modal-header">
                <div class="modal-title">
                    <i class="fa-brands fa-google-drive"></i>
                    <h3>Guardar en Google Drive</h3>
                </div>
                <button class="modal-close" @click="cerrar" aria-label="Cerrar">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>

            <div class="modal-body">
                <!-- Información del archivo -->
                <div class="file-info">
                    <i class="fa-solid fa-file-pdf"></i>
                    <div class="file-details">
                        <p class="file-name">{{ nombreArchivo }}</p>
                        <p class="file-size">{{ formatearTamaño(archivoTamaño) }}</p>
                    </div>
                </div>

                <!-- Formulario -->
                <form @submit.prevent="guardar">
                    <div class="form-group">
                        <label for="tipoReporte">Tipo de Reporte *</label>
                        <select id="tipoReporte" v-model="formData.tipoReporte" required :disabled="guardando">
                            <option value="">Seleccione un tipo</option>
                            <option v-for="tipo in tiposReporte" :key="tipo.value" :value="tipo.value">
                                {{ tipo.label }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="descripcion">Descripción (opcional)</label>
                        <textarea id="descripcion" v-model="formData.descripcion"
                            placeholder="Describe el contenido del reporte..." rows="4"
                            :disabled="guardando"></textarea>
                    </div>

                    <!-- Mensaje de error -->
                    <div v-if="error" class="error-message">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        {{ error }}
                    </div>

                    <!-- Mensaje de éxito -->
                    <div v-if="exitoMensaje" class="success-message">
                        <i class="fa-solid fa-circle-check"></i>
                        {{ exitoMensaje }}
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" @click="cerrar" :disabled="guardando">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-primary" :disabled="guardando || !formData.tipoReporte">
                            <i v-if="guardando" class="fa-solid fa-spinner fa-spin"></i>
                            <i v-else class="fa-brands fa-google-drive"></i>
                            {{ guardando ? 'Guardando...' : 'Guardar en Drive' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import archivoService from '@/services/archivoService';

export default {
    name: 'GuardarDriveModal',
    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        archivo: {
            type: [File, Blob],
            default: null
        },
        nombreArchivo: {
            type: String,
            default: 'archivo.pdf'
        },
        tipoReporteDefault: {
            type: String,
            default: 'inventario'
        }
    },
    data() {
        return {
            formData: {
                tipoReporte: this.tipoReporteDefault,
                descripcion: ''
            },
            tiposReporte: [],
            guardando: false,
            error: null,
            exitoMensaje: null
        };
    },
    computed: {
        archivoTamaño() {
            if (this.archivo) {
                return this.archivo.size || 0;
            }
            return 0;
        }
    },
    watch: {
        isOpen(newVal) {
            if (newVal) {
                this.cargarTiposReporte();
                this.resetForm();
            }
        }
    },
    methods: {
        async cargarTiposReporte() {
            try {
                this.tiposReporte = await archivoService.obtenerTiposReporte();
            } catch (error) {
                console.error('Error al cargar tipos de reporte:', error);
                this.tiposReporte = [
                    { value: 'inventario', label: 'Inventario' },
                    { value: 'clientes', label: 'Clientes' },
                    { value: 'proveedores', label: 'Proveedores' },
                    { value: 'pedidos', label: 'Pedidos de Material' },
                    { value: 'materias_primas', label: 'Materias Primas' },
                    { value: 'ordenes', label: 'Ordenes de Cliente' },
                    { value: 'otro', label: 'Otro' }
                ];
            }
        },

        async guardar() {
            if (!this.archivo) {
                this.error = 'No hay archivo para guardar';
                return;
            }

            if (!this.formData.tipoReporte) {
                this.error = 'Debe seleccionar un tipo de reporte';
                return;
            }

            this.guardando = true;
            this.error = null;
            this.exitoMensaje = null;

            try {
                const resultado = await archivoService.subirArchivo(
                    this.archivo,
                    this.formData.tipoReporte,
                    this.formData.descripcion
                );

                this.exitoMensaje = 'Archivo guardado exitosamente en Google Drive';

                // Emitir evento de éxito
                this.$emit('guardado', resultado);

                // Cerrar modal después de 1.5 segundos
                setTimeout(() => {
                    this.cerrar();
                }, 1500);

            } catch (error) {
                console.error('Error al guardar archivo:', error);
                this.error = error.response?.data?.error ||
                    'Error al guardar el archivo. Intente nuevamente.';
            } finally {
                this.guardando = false;
            }
        },

        cerrar() {
            if (!this.guardando) {
                this.resetForm();
                this.$emit('cerrar');
            }
        },

        resetForm() {
            this.formData = {
                tipoReporte: this.tipoReporteDefault,
                descripcion: ''
            };
            this.error = null;
            this.exitoMensaje = null;
        },

        formatearTamaño(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
        }
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 20px;
}

.modal-container {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease-out;
    box-sizing: border-box; /* Evita que los bordes internos rompan el layout */
    overflow: hidden; /* Previene que elementos se salgan del contenedor */
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.modal-title i {
    font-size: 24px;
    color: #4285f4;
}

.modal-title h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
}

.modal-close {
    background: none;
    border: none;
    font-size: 20px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s;
}

.modal-close:hover {
    color: #1f2937;
}

.modal-body {
    padding: 24px;
}

.file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 24px;
}

.file-info i {
    font-size: 32px;
    color: #ef4444;
}

.file-details {
    flex: 1;
}

.file-name {
    font-weight: 500;
    color: #1f2937;
    margin: 0 0 4px 0;
}

.file-size {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
}

.form-group select,
.form-group textarea {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box; /* Incluye padding/border dentro del ancho */
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

.form-group select:disabled,
.form-group textarea:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.form-group textarea {
    resize: vertical;
    font-family: inherit;
    display: block;
}

.error-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    font-size: 0.875rem;
    margin-bottom: 16px;
}

.success-message {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 6px;
    color: #16a34a;
    font-size: 0.875rem;
    margin-bottom: 16px;
}

.modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
}

.btn-secondary:hover:not(:disabled) {
    background: #e5e7eb;
}

.btn-primary {
    background: #4285f4;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #3b78e7;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.btn-primary:disabled,
.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .modal-container {
        max-width: 100%;
    }

    .modal-header,
    .modal-body {
        padding: 16px;
    }

    .modal-footer {
        flex-direction: column;
    }

    .btn-secondary,
    .btn-primary {
        width: 100%;
        justify-content: center;
    }
}
</style>