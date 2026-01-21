<template>
    <transition name="dialog-fade">
        <div v-if="visible" class="dialog-overlay" @click="close">
            <div class="dialog-card form-modal large-modal" @click.stop>
                <div class="modal-header">
                    <h2>{{ isEdit ? 'Editar Orden' : 'Nueva Orden de Cliente' }}</h2>
                    <button class="btn-icon" @click="close" aria-label="Cerrar">✖</button>
                </div>

                <div class="content">
                    <form @submit.prevent="submit">
                        <!-- Información de la Orden -->
                        <div class="section-header">Información de Orden</div>

                        <div class="form-grid">
                            <div class="form-field">
                                <label for="client">Cliente *</label>
                                <select id="client" v-model="form.client" required>
                                    <option value="">Seleccione un cliente</option>
                                    <option v-for="cliente in clientes" :key="cliente.cliente_id"
                                        :value="cliente.cliente_id">
                                        {{ cliente.nombre_empresa }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="order_code">Código de Orden *</label>
                                <input id="order_code" v-model="form.order_code" maxlength="50" required
                                    placeholder="Ej: ORD-2025-001" />
                            </div>

                            <div class="form-field">
                                <label for="order_date">Fecha de Orden *</label>
                                <input id="order_date" type="date" v-model="form.order_date" required />
                            </div>

                            <div class="form-field">
                                <label for="status">Estado *</label>
                                <select id="status" v-model="form.status" required>
                                    <option value="pending">Pendiente</option>
                                    <option value="confirmed">Confirmada</option>
                                    <option value="in_progress">En Proceso</option>
                                    <option value="completed">Completada</option>
                                    <option value="cancelled">Cancelada</option>
                                </select>
                            </div>

                            <div class="form-field">
                                <label for="tax_rate">Tasa de Impuesto (%) *</label>
                                <input id="tax_rate" type="number" v-model.number="form.tax_rate" step="0.01" min="0"
                                    max="100" required placeholder="Ej: 15.00" />
                            </div>

                            <div class="form-field full">
                                <label for="notes">Notas</label>
                                <textarea id="notes" v-model="form.notes"
                                    placeholder="Observaciones o instrucciones especiales"></textarea>
                            </div>
                        </div>

                        <!-- Items de la Orden -->
                        <div class="section-header">
                            Items de la Orden
                            <button type="button" class="btn-add-item" @click="agregarItem">
                                <i class="fa-solid fa-plus"></i> Agregar Item
                            </button>
                        </div>

                        <div class="items-container">
                            <div v-if="form.items.length === 0" class="empty-items">
                                <p>No hay items agregados. Click en "Agregar Item" para comenzar.</p>
                            </div>

                            <div v-for="(item, index) in form.items" :key="index" class="item-row">
                                <div class="item-number">{{ index + 1 }}</div>

                                <div class="item-field">
                                    <label>Producto *</label>
                                    <select v-model="item.product" @change="onProductChange(item)" required>
                                        <option value="">Seleccione</option>
                                        <option v-for="producto in productos" :key="producto.producto_id"
                                            :value="producto.producto_id">
                                            {{ producto.nombre }} - ${{ producto.precio }}
                                        </option>
                                    </select>
                                </div>

                                <div class="item-field">
                                    <label>Cantidad *</label>
                                    <input type="number" v-model.number="item.quantity" min="1"
                                        @input="calcularSubtotal(item)" required placeholder="0" />
                                </div>

                                <div class="item-field">
                                    <label>Unidad</label>
                                    <input type="text" :value="item.unit_nombre" readonly disabled />
                                </div>

                                <div class="item-field">
                                    <label>Subtotal</label>
                                    <input type="text" :value="'$' + item.subtotal.toFixed(2)" readonly disabled />
                                </div>

                                <div class="item-actions">
                                    <button type="button" class="btn-icon btn-delete" @click="eliminarItem(index)"
                                        title="Eliminar item">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Totales -->
                        <div class="totales-section">
                            <div class="total-row">
                                <span class="total-label">Subtotal:</span>
                                <span class="total-value">${{ subtotalOrden.toFixed(2) }}</span>
                            </div>
                            <div class="total-row">
                                <span class="total-label">Impuesto ({{ form.tax_rate }}%):</span>
                                <span class="total-value">${{ impuestoOrden.toFixed(2) }}</span>
                            </div>
                            <div class="total-row total-final">
                                <span class="total-label">Total:</span>
                                <span class="total-value">${{ totalOrden.toFixed(2) }}</span>
                            </div>
                        </div>

                        <!-- Acciones -->
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" @click="close">Cancelar</button>
                            <button type="submit" class="btn-primary" :disabled="saving">
                                {{ saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Orden') }}
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
import ordenClienteService from '../services/ordenClienteService'
import clientesService from '../services/clientesService'
import productosService from '../services/productosService'

const props = defineProps({
    show: { type: Boolean, default: false },
    editId: { type: [String, Number], default: null }
})
const emit = defineEmits(['close', 'saved'])

const visible = ref(props.show)
const isEdit = ref(false)
const saving = ref(false)
const clientes = ref([])
const productos = ref([])

const form = reactive({
    client: '',
    order_code: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'pending',
    tax_rate: 0,
    notes: '',
    items: []
})

// Computed properties para totales
const subtotalOrden = computed(() => {
    return form.items.reduce((sum, item) => sum + item.subtotal, 0)
})

const impuestoOrden = computed(() => {
    return (subtotalOrden.value * (form.tax_rate / 100))
})

const totalOrden = computed(() => {
    return subtotalOrden.value + impuestoOrden.value
})

watch(() => props.show, (v) => {
    visible.value = v
    if (v) {
        cargarDatos()
    }
})

watch(() => props.editId, (id) => {
    if (id) loadOrden(id)
})

onMounted(() => {
    if (props.show) {
        cargarDatos()
    }
})

async function cargarDatos() {
    try {
        // Cargar clientes
        const clientesRes = await clientesService.getClientes(1, 1000)
        clientes.value = clientesRes.results || clientesRes || []

        // Cargar productos
        const productosRes = await productosService.getProductos(1, 1000)
        productos.value = productosRes.results || productosRes || []
    } catch (error) {
        console.error('Error cargando datos:', error)
    }
}

function resetForm() {
    form.client = ''
    form.order_code = ''
    form.order_date = new Date().toISOString().split('T')[0]
    form.status = 'pending'
    form.tax_rate = 0
    form.notes = ''
    form.items = []
}

function agregarItem() {
    form.items.push({
        product: '',
        quantity: 1,
        unit: '',
        unit_nombre: '',
        subtotal: 0
    })
}

function eliminarItem(index) {
    form.items.splice(index, 1)
}

function onProductChange(item) {
    const producto = productos.value.find(p => p.producto_id === item.product)
    if (producto) {
        item.unit = producto.unidad_id
        item.unit_nombre = producto.unidad_nombre || 'N/A'
        calcularSubtotal(item)
    }
}

function calcularSubtotal(item) {
    const producto = productos.value.find(p => p.producto_id === item.product)
    if (producto && item.quantity > 0) {
        item.subtotal = producto.precio * item.quantity
    } else {
        item.subtotal = 0
    }
}

async function loadOrden(id) {
    if (!id) return
    saving.value = true
    try {
        const data = await ordenClienteService.getOrden(id)
        form.client = data.client
        form.order_code = data.order_code
        form.order_date = data.order_date
        form.status = data.status
        form.tax_rate = parseFloat(data.tax_rate) || 0
        form.notes = data.notes || ''

        // Cargar items
        const itemsRes = await ordenClienteService.getOrdenItems(id)
        form.items = (itemsRes.results || itemsRes || []).map(item => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            unit: item.unit,
            unit_nombre: item.unit_nombre || 'N/A',
            subtotal: parseFloat(item.subtotal) || 0
        }))

        isEdit.value = true
    } catch (e) {
        console.error('Error cargando orden:', e)
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
    if (form.items.length === 0) {
        alert('Debe agregar al menos un item a la orden')
        return
    }

    saving.value = true
    try {
        const payload = {
            client: form.client,
            order_code: form.order_code,
            order_date: form.order_date,
            status: form.status,
            tax_rate: form.tax_rate,
            notes: form.notes || null,
            items: form.items.map(item => ({
                product: item.product,
                quantity: item.quantity,
                unit: item.unit
            }))
        }

        if (props.editId) {
            await ordenClienteService.updateOrden(props.editId, payload)
            emit('saved', { action: 'updated' })
        } else {
            await ordenClienteService.createOrden(payload)
            emit('saved', { action: 'created' })
        }

        close()
    } catch (e) {
        console.error('Error guardando orden:', e)
        alert('Error al guardar la orden. Verifique los datos.')
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
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.large-modal {
    max-width: 1000px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e0e0;
    background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
    border-radius: 12px 12px 0 0;
    position: sticky;
    top: 0;
    z-index: 10;
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

.section-header {
    background: #f3f4f6;
    padding: 12px 16px;
    border-radius: 8px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-add-item {
    background: #4f6f8f;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-add-item:hover {
    background: #5a7ea0;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
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

.form-field input:disabled,
.form-field select:disabled {
    background: #f3f4f6;
    color: #6b7280;
}

.form-field textarea {
    resize: vertical;
    min-height: 60px;
    font-family: inherit;
}

/* Items */
.items-container {
    margin-bottom: 24px;
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
}

.empty-items {
    text-align: center;
    padding: 32px;
    color: #6b7280;
}

.item-row {
    display: grid;
    grid-template-columns: 40px 2fr 1fr 1fr 1fr 50px;
    gap: 12px;
    align-items: end;
    background: white;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
}

.item-number {
    width: 32px;
    height: 32px;
    background: #4f6f8f;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
    margin-top: auto;
}

.item-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-field label {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
}

.item-field input,
.item-field select {
    padding: 8px 10px;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    font-size: 14px;
}

.item-actions {
    display: flex;
    align-items: flex-end;
    padding-bottom: 4px;
}

.item-actions .btn-icon {
    background: transparent;
    border: none;
    color: #ef4444;
    font-size: 18px;
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    transition: background 0.2s;
}

.item-actions .btn-icon:hover {
    background: rgba(239, 68, 68, 0.1);
}

/* Totales */
.totales-section {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    max-width: 400px;
    margin-left: auto;
}

.total-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
}

.total-row.total-final {
    border-top: 2px solid #4f6f8f;
    margin-top: 8px;
    padding-top: 12px;
    font-size: 18px;
    font-weight: 700;
    color: #4f6f8f;
}

.total-label {
    color: #6b7280;
}

.total-value {
    font-weight: 600;
    color: #374151;
}

.total-final .total-value {
    color: #4f6f8f;
}

/* Acciones */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
}

.btn-primary {
    background: linear-gradient(135deg, #4f6f8f 0%, #5a7ea0 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79, 111, 143, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5dd;
}

.btn-secondary:hover {
    background: #e5e7eb;
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

    .item-row {
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .item-number {
        margin: 0;
    }

    .totales-section {
        max-width: 100%;
    }
}
</style>
