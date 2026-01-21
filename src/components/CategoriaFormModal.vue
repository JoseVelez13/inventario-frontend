<template>
    <transition name="dialog-fade">
        <div v-if="visible" class="dialog-overlay" @click="close">
            <div class="dialog-card form-modal" @click.stop>
                <div class="modal-header">
                    <h2>{{ isEdit ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
                    <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
                </div>

                <div class="content">
                    <form @submit.prevent="submit">
                        <div class="form-grid">
                            <div class="form-field full">
                                <label for="nombre">Nombre *</label>
                                <input id="nombre" v-model="form.nombre" maxlength="100" required
                                    placeholder="Ej: Químicos de limpieza" />
                            </div>

                            <div class="form-field full">
                                <label for="tipo">Tipo *</label>
                                <select id="tipo" v-model="form.tipo" required>
                                    <option value="">Seleccione un tipo</option>
                                    <option value="PRODUCT">Producto</option>
                                    <option value="RAW_MATERIAL">Materia Prima</option>
                                </select>
                            </div>

                            <div class="form-field full">
                                <label for="descripcion">Descripción</label>
                                <textarea id="descripcion" v-model="form.descripcion"
                                    placeholder="Descripción opcional de la categoría" rows="4"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                {{ isEdit ? 'Actualizar' : 'Crear' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'
import categoriasService from '../services/categoriasService'

const props = defineProps({
    show: { type: Boolean, default: false },
    editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const loading = ref(false)

const form = reactive({
    nombre: '',
    tipo: '',
    descripcion: ''
})

watch(() => props.show, (v) => { visible.value = v })
watch(() => props.editId, (id) => { if (id) loadCategoria(id) })

function resetForm() {
    form.nombre = ''
    form.tipo = ''
    form.descripcion = ''
}

async function loadCategoria(id) {
    if (!id) return
    loading.value = true
    try {
        const data = await categoriasService.getCategoria(id)
        form.nombre = data.nombre || ''
        form.tipo = data.tipo || ''
        form.descripcion = data.descripcion || ''
        isEdit.value = true
    } catch (e) {
        console.error('Error cargando categoría para editar', e)
    } finally {
        loading.value = false
    }
}

function close() {
    visible.value = false
    isEdit.value = false
    resetForm()
    emit('close')
}

async function submit() {
    try {
        const payload = {
            nombre: form.nombre,
            tipo: form.tipo,
            descripcion: form.descripcion || null
        }

        if (props.editId) {
            await categoriasService.updateCategoria(props.editId, payload)
            emit('saved', { action: 'updated' })
        } else {
            await categoriasService.createCategoria(payload)
            emit('saved', { action: 'created' })
        }

        close()
    } catch (e) {
        console.error('Error guardando categoría', e)
        alert('Error al guardar la categoría. Verifique los datos.')
    }
}
</script>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
}

.dialog-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e0e0;
    background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
    border-radius: 12px 12px 0 0;
}

.modal-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: white;
}

.modal-header .btn-icon {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.modal-header .btn-icon:hover {
    background: rgba(255, 255, 255, 0.3);
}

.content {
    padding: 24px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-field.full {
    grid-column: 1 / -1;
}

.form-field label {
    font-weight: 500;
    color: #333;
    font-size: 14px;
}

.form-field input,
.form-field select,
.form-field textarea {
    padding: 10px 12px;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
    outline: none;
    border-color: #4f6f8f;
    box-shadow: 0 0 0 3px rgba(79, 111, 143, 0.1);
}

.form-field textarea {
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
}

.form-actions {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-primary {
    background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 111, 143, 0.3);
}

.btn-primary:active {
    transform: translateY(0);
}

/* Transitions */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
    transition: opacity 0.3s ease;
}

.dialog-fade-enter-active .dialog-card,
.dialog-fade-leave-active .dialog-card {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
    opacity: 0;
}

.dialog-fade-enter-from .dialog-card,
.dialog-fade-leave-to .dialog-card {
    transform: scale(0.9);
    opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-field.full {
        grid-column: 1;
    }
}
</style>