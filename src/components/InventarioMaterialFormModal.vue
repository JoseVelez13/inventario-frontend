<template>
    <transition name="dialog-fade">
        <div v-if="visible" class="dialog-overlay" @click="close">
            <div class="dialog-card form-modal" @click.stop>
                <div class="modal-header">
                    <h2>{{ isEdit ? 'Editar Inventario' : 'Nuevo Registro de Inventario' }}</h2>
                    <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
                </div>

                <div class="content">
                    <form @submit.prevent="submit">
                        <div class="form-grid">
                            <!-- Tipo de Ítem -->
                            <div class="form-field full">
                                <label for="tipo_item">Tipo de Ítem *</label>
                                <select id="tipo_item" v-model="form.tipo_item" @change="onTipoChange" required
                                    :disabled="isEdit">
                                    <option value="">Seleccione un tipo</option>
                                    <option value="materia_prima">Materia Prima</option>
                                    <option value="producto">Producto</option>
                                </select>
                                <small v-if="isEdit" class="form-hint">No se puede cambiar el tipo al editar</small>
                            </div>

                            <!-- Ítem (dinámico según tipo) -->
                            <div class="form-field full">
                                <label for="object_id">{{ form.tipo_item === 'materia_prima' ? 'Materia Prima' :
                                    'Producto' }} *</label>
                                <select id="object_id" v-model="form.object_id" @change="onItemChange" required
                                    :disabled="!form.tipo_item || isEdit">
                                    <option value="">Seleccione un ítem</option>
                                    <option v-for="item in itemsDisponibles" :key="item.id" :value="item.id">
                                        {{ item.nombre }}
                                    </option>
                                </select>
                                <small v-if="isEdit" class="form-hint">No se puede cambiar el ítem al editar</small>
                            </div>

                            <!-- Almacén -->
                            <div class="form-field">
                                <label for="almacen_id">Almacén *</label>
                                <select id="almacen_id" v-model="form.almacen_id" required :disabled="isEdit">
                                    <option value="">Seleccione un almacén</option>
                                    <option v-for="almacen in almacenes" :key="almacen.almacen_id"
                                        :value="almacen.almacen_id">
                                        {{ almacen.nombre }}
                                    </option>
                                </select>
                                <small v-if="isEdit" class="form-hint">No se puede cambiar el almacén al editar</small>
                            </div>

                            <!-- Unidad -->
                            <div class="form-field">
                                <label for="unidad_id">Unidad de Medida *</label>
                                <select id="unidad_id" v-model="form.unidad_id" required
                                    :disabled="unidadAutoSeleccionada">
                                    <option value="">Seleccione una unidad</option>
                                    <option v-for="unidad in unidades" :key="unidad.unidad_id"
                                        :value="unidad.unidad_id">
                                        {{ unidad.nombre }} ({{ unidad.simbolo }})
                                    </option>
                                </select>
                                <small v-if="unidadAutoSeleccionada" class="form-hint">Unidad del ítem
                                    seleccionado</small>
                            </div>

                            <!-- Cantidad -->
                            <div class="form-field full">
                                <label for="cantidad">Cantidad *</label>
                                <input id="cantidad" type="number" v-model.number="form.cantidad" step="0.01" min="0"
                                    required placeholder="0.00" />
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary" :disabled="saving">
                                {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar') }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch, reactive, computed, onMounted } from 'vue'
import inventarioMaterialService from '../services/inventarioMaterialService'
import materiasPrimasService from '../services/materiasPrimasService'
import productosService from '../services/productosService'
import almacenesService from '../services/almacenesService'
import unidadesService from '../services/unidadesService'

const props = defineProps({
    show: { type: Boolean, default: false },
    editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const saving = ref(false)
const unidadAutoSeleccionada = ref(false)

const almacenes = ref([])
const unidades = ref([])
const materiasPrimas = ref([])
const productos = ref([])

const form = reactive({
    tipo_item: '',
    object_id: '',
    almacen_id: '',
    unidad_id: '',
    cantidad: 0
})

const itemsDisponibles = computed(() => {
    if (form.tipo_item === 'materia_prima') {
        return materiasPrimas.value.map(mp => ({
            id: mp.materia_prima_id,
            nombre: mp.nombre,
            unidad_id: mp.unidad_id
        }))
    } else if (form.tipo_item === 'producto') {
        return productos.value.map(p => ({
            id: p.producto_id,
            nombre: p.nombre,
            unidad_id: p.unidad_id
        }))
    }
    return []
})

watch(() => props.show, (v) => {
    visible.value = v
    if (v) {
        cargarDatos()
    }
})

watch(() => props.editId, (id) => {
    if (id) loadInventario(id)
})

onMounted(() => {
    if (props.show) {
        cargarDatos()
    }
})

async function cargarDatos() {
    try {
        // Cargar almacenes
        const almacenesRes = await almacenesService.getAlmacenes(1, 1000)
        almacenes.value = almacenesRes.results || almacenesRes || []

        // Cargar unidades
        const unidadesRes = await unidadesService.getUnidades(1, 1000)
        unidades.value = unidadesRes.results || unidadesRes || []

        // Cargar materias primas
        const mpRes = await materiasPrimasService.getMateriasPrimas(1, 1000)
        materiasPrimas.value = mpRes.results || mpRes || []

        // Cargar productos
        const prodRes = await productosService.getProductos(1, 1000)
        productos.value = prodRes.results || prodRes || []
    } catch (error) {
        console.error('Error cargando datos:', error)
    }
}

function resetForm() {
    form.tipo_item = ''
    form.object_id = ''
    form.almacen_id = ''
    form.unidad_id = ''
    form.cantidad = 0
    unidadAutoSeleccionada.value = false
}

function onTipoChange() {
    form.object_id = ''
    form.unidad_id = ''
    unidadAutoSeleccionada.value = false
}

function onItemChange() {
    // Auto-seleccionar la unidad del ítem
    const item = itemsDisponibles.value.find(i => i.id === form.object_id)
    if (item && item.unidad_id) {
        form.unidad_id = item.unidad_id
        unidadAutoSeleccionada.value = true
    } else {
        form.unidad_id = ''
        unidadAutoSeleccionada.value = false
    }
}

async function loadInventario(id) {
    if (!id) return
    saving.value = true
    try {
        const data = await inventarioMaterialService.getInventario(id)

        // Convertir item_tipo del backend a tipo_item del form
        const tipoMap = {
            'MATERIA_PRIMA': 'materia_prima',
            'PRODUCTO': 'producto'
        }

        form.tipo_item = tipoMap[data.item_tipo] || data.item_tipo || ''
        form.object_id = data.object_id || ''
        form.almacen_id = data.almacen_id || ''
        form.unidad_id = data.unidad_id || ''
        form.cantidad = parseFloat(data.cantidad) || 0
        isEdit.value = true
    } catch (e) {
        console.error('Error cargando inventario para editar', e)
    } finally {
        saving.value = false
    }
}

function close() {
    visible.value = false
    isEdit.value = false
    resetForm()
    emit('close')
}

async function submit() {
    saving.value = true
    try {
        // Convertir tipo_item a content_type para el backend
        let contentTypeId

        if (form.tipo_item === 'materia_prima') {
            // Necesitas obtener el ContentType ID para MateriaPrima
            // Esto depende de cómo tu backend maneje ContentTypes
            // Opción 1: Enviar el nombre del modelo
            contentTypeId = 'materia_prima'
        } else if (form.tipo_item === 'producto') {
            contentTypeId = 'producto'
        }

        const payload = {
            content_type: contentTypeId,
            object_id: form.object_id,
            almacen_id: form.almacen_id,
            unidad_id: form.unidad_id,
            cantidad: form.cantidad
        }

        if (props.editId) {
            await inventarioMaterialService.updateInventario(props.editId, payload)
            emit('saved', { action: 'updated' })
        } else {
            await inventarioMaterialService.createInventario(payload)
            emit('saved', { action: 'created' })
        }

        close()
    } catch (e) {
        console.error('Error guardando inventario', e)
        alert('Error al guardar el inventario. Verifique los datos.')
    } finally {
        saving.value = false
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
    max-width: 700px;
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
.form-field select {
    padding: 10px 12px;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
}

.form-field input:focus,
.form-field select:focus {
    outline: none;
    border-color: #4f6f8f;
    box-shadow: 0 0 0 3px rgba(79, 111, 143, 0.1);
}

.form-field input:disabled,
.form-field select:disabled {
    background: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
}

.form-hint {
    font-size: 12px;
    color: #6b7280;
    font-style: italic;
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

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 111, 143, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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