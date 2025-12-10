<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click="close">
      <div class="dialog-card import-export-card" @click.stop>
        <!-- Header -->
        <div class="dialog-header">
          <h2>{{ mode === 'import' ? '📥 Importar Datos' : '📤 Exportar Datos' }}</h2>
          <button class="btn-close" @click="close">✕</button>
        </div>

        <!-- MODO EXPORTAR -->
        <div v-if="mode === 'export'" class="dialog-content">
          <p class="description">Selecciona el formato para exportar {{ itemCount }} {{ entityName }}(s):</p>
          
          <div class="format-buttons">
            <button class="format-btn excel" @click="exportExcel">
              <span class="icon">📊</span>
              <span class="label">Excel (.xlsx)</span>
            </button>
            <button class="format-btn csv" @click="exportCSV">
              <span class="icon">📄</span>
              <span class="label">CSV (.csv)</span>
            </button>
            <button class="format-btn json" @click="exportJSON">
              <span class="icon">{ }</span>
              <span class="label">JSON (.json)</span>
            </button>
            <button class="format-btn pdf" @click="exportPDF">
              <span class="icon">📑</span>
              <span class="label">PDF (.pdf)</span>
            </button>
          </div>
        </div>

        <!-- MODO IMPORTAR -->
        <div v-if="mode === 'import'" class="dialog-content">
          <!-- Paso 1: Seleccionar archivo -->
          <div v-if="step === 1" class="import-step">
            <p class="description">Selecciona un archivo para importar {{ entityName }}s:</p>
            
            <div class="file-upload-area" @click="$refs.fileInput.click()" 
                 @dragover.prevent="dragover = true" 
                 @dragleave="dragover = false"
                 @drop.prevent="handleDrop"
                 :class="{ dragover }">
              <input ref="fileInput" type="file" hidden 
                     accept=".xlsx,.csv,.json" 
                     @change="handleFileSelect">
              <div class="upload-icon">📁</div>
              <p v-if="!selectedFile" class="upload-text">
                Haz clic o arrastra un archivo aquí
              </p>
              <p v-else class="selected-file">
                <strong>{{ selectedFile.name }}</strong> ({{ formatFileSize(selectedFile.size) }})
              </p>
              <p class="formats-supported">Formatos: Excel (.xlsx), CSV (.csv), JSON (.json)</p>
            </div>

            <button v-if="selectedFile" class="btn-primary" @click="processFile">
              Analizar archivo
            </button>
          </div>

          <!-- Paso 2: Vista previa y validación -->
          <div v-if="step === 2" class="preview-step">
            <div class="preview-header">
              <h3>Vista Previa ({{ parsedData.length }} registros)</h3>
              <button class="btn-secondary-small" @click="step = 1">← Cambiar archivo</button>
            </div>

            <!-- Errores/Advertencias -->
            <div v-if="validationErrors.length > 0" class="validation-errors">
              <h4>⚠️ Problemas detectados ({{ validationErrors.length }})</h4>
              <div class="error-list">
                <div v-for="(error, idx) in validationErrors.slice(0, 5)" :key="idx" class="error-item">
                  <span class="error-row">Fila {{ error.row }}:</span>
                  <span class="error-msg">{{ error.message }}</span>
                </div>
                <p v-if="validationErrors.length > 5" class="more-errors">
                  ...y {{ validationErrors.length - 5 }} errores más
                </p>
              </div>
            </div>

            <!-- Tabla de vista previa -->
            <div class="preview-table-container">
              <table class="preview-table">
                <thead>
                  <tr>
                    <th v-for="col in previewColumns" :key="col">{{ col }}</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in parsedData.slice(0, 10)" :key="idx"
                      :class="{ 'row-error': item._hasError, 'row-warning': item._hasWarning }">
                    <td v-for="col in previewColumns" :key="col">{{ item[col] || '-' }}</td>
                    <td>
                      <span v-if="item._hasError" class="badge-error">❌ Error</span>
                      <span v-else-if="item._hasWarning" class="badge-warning">⚠️ Advertencia</span>
                      <span v-else class="badge-success">✅ OK</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="parsedData.length > 10" class="preview-note">
                Mostrando 10 de {{ parsedData.length }} registros
              </p>
            </div>

            <!-- Botones de acción -->
            <div class="action-buttons">
              <button class="btn-secondary" @click="close">Cancelar</button>
              <button class="btn-primary" @click="confirmImport" 
                      :disabled="validationErrors.filter(e => e.severity === 'error').length > 0">
                Importar {{ validDataCount }} registro(s)
              </button>
            </div>
          </div>

          <!-- Paso 3: Importando -->
          <div v-if="step === 3" class="importing-step">
            <div class="loading-spinner"></div>
            <p>Importando datos...</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: importProgress + '%' }"></div>
            </div>
            <p class="progress-text">{{ importedCount }} / {{ totalToImport }}</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default {
  name: 'ImportExportDialog',
  
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'export', // 'export' | 'import'
      validator: v => ['export', 'import'].includes(v)
    },
    entityName: {
      type: String,
      default: 'producto' // 'producto' | 'cliente' | 'materia_prima'
    },
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    itemCount: {
      type: Number,
      default: 0
    }
  },

  emits: ['close', 'import-complete'],

  data() {
    return {
      visible: this.show,
      step: 1, // 1: seleccionar, 2: previa, 3: importando
      selectedFile: null,
      parsedData: [],
      validationErrors: [],
      dragover: false,
      importProgress: 0,
      importedCount: 0,
      totalToImport: 0
    }
  },

  computed: {
    previewColumns() {
      if (this.parsedData.length === 0) return []
      return Object.keys(this.parsedData[0]).filter(k => !k.startsWith('_'))
    },
    
    validDataCount() {
      return this.parsedData.filter(item => !item._hasError).length
    }
  },

  watch: {
    show(newVal) {
      this.visible = newVal
      if (newVal) {
        this.resetState()
      }
    }
  },

  methods: {
    close() {
      this.visible = false
      this.$emit('close')
    },

    resetState() {
      this.step = 1
      this.selectedFile = null
      this.parsedData = []
      this.validationErrors = []
      this.importProgress = 0
    },

    // ========== EXPORTAR ==========
    exportExcel() {
      const ws = XLSX.utils.json_to_sheet(this.data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, this.entityName)
      XLSX.writeFile(wb, `${this.entityName}s_${this.getTimestamp()}.xlsx`)
      this.close()
    },

    exportCSV() {
      const csv = Papa.unparse(this.data)
      this.downloadFile(csv, `${this.entityName}s_${this.getTimestamp()}.csv`, 'text/csv')
      this.close()
    },

    exportJSON() {
      const json = JSON.stringify(this.data, null, 2)
      this.downloadFile(json, `${this.entityName}s_${this.getTimestamp()}.json`, 'application/json')
      this.close()
    },

    exportPDF() {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text(`Lista de ${this.entityName}s`, 14, 20)
      
      const tableData = this.data.map(item => this.columns.map(col => item[col.key] || '-'))
      const headers = this.columns.map(col => col.label)

      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 111, 143] }
      })

      doc.save(`${this.entityName}s_${this.getTimestamp()}.pdf`)
      this.close()
    },

    // ========== IMPORTAR ==========
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0]
    },

    handleDrop(event) {
      this.dragover = false
      this.selectedFile = event.dataTransfer.files[0]
    },

    async processFile() {
      if (!this.selectedFile) return

      const ext = this.selectedFile.name.split('.').pop().toLowerCase()

      try {
        if (ext === 'xlsx') {
          await this.parseExcel()
        } else if (ext === 'csv') {
          await this.parseCSV()
        } else if (ext === 'json') {
          await this.parseJSON()
        }

        this.validateData()
        this.step = 2
      } catch (error) {
        console.error('Error al procesar archivo:', error)
        alert('Error al leer el archivo. Verifica el formato.')
      }
    },

    async parseExcel() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            this.parsedData = XLSX.utils.sheet_to_json(firstSheet)
            console.log('Excel parseado:', this.parsedData.length, 'filas')
            console.log('Primera fila:', this.parsedData[0])
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(this.selectedFile)
      })
    },

    async parseCSV() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const result = Papa.parse(e.target.result, { header: true, skipEmptyLines: true })
            this.parsedData = result.data
            console.log('CSV parseado:', this.parsedData.length, 'filas')
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsText(this.selectedFile)
      })
    },

    async parseJSON() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            this.parsedData = JSON.parse(e.target.result)
            console.log('JSON parseado:', this.parsedData.length, 'filas')
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsText(this.selectedFile)
      })
    },

    validateData() {
      console.log('validateData - parsedData antes:', this.parsedData.length, 'filas')
      console.log('validateData - primera fila antes:', this.parsedData[0])
      this.validationErrors = []
      
      this.parsedData.forEach((item, idx) => {
        const rowNum = idx + 2 // Excel row (header = 1)
        
        // Validaciones según el tipo de entidad
        if (this.entityName === 'producto') {
          // Mapeo de unidades de texto a IDs (según la base de datos)
          const unidadTextoAId = {
            'kg': 2, 'kilogramo': 2, 'kilo': 2,
            'g': 3, 'gramo': 3, 'gramos': 3,
            'l': 4, 'litro': 4, 'litros': 4,
            'ml': 5, 'mililitro': 5, 'mililitros': 5,
            'u': 6, 'unidad': 6, 'unidades': 6, 'pieza': 6, 'piezas': 6,
            'caja': 7, 'cajas': 7,
            'gal': 8, 'galón': 8, 'galon': 8, 'galones': 8,
            'bbl': 9, 'barril': 9, 'barriles': 9,
            'botella': 4, 'botellas': 4, 'frasco': 4 // Asumiendo líquido = litros
          }

          // Extraer unidad del texto
          let unidadId = 2 // Por defecto Kilogramo (kg)
          const unidadTexto = (item.unit || item.unidad || item['Unidad de Medida'] || item.unidad_medida || '').toString().toLowerCase()
          
          // Buscar coincidencia en el texto de unidad
          for (const [texto, id] of Object.entries(unidadTextoAId)) {
            if (unidadTexto.includes(texto)) {
              unidadId = id
              break
            }
          }

          // Normalizar nombres de campos - IMPORTANTE: asignar directamente al item
          item.product_code = item.product_code || item.codigo || item.code || item['Código'] || item['código'] || ''
          item.name = item.name || item.nombre || item['Nombre'] || item['Nombre del Producto'] || item.producto || ''
          item.description = item.description || item.descripcion || item['Descripción'] || item['descripción'] || ''
          item.unit = unidadId
          item.weight = parseFloat(item.weight || item.peso || item['Peso (kg)'] || item.peso_kg || 0)
          
          if (idx === 0) {
            console.log('validateData - primera fila después de normalizar:', {
              product_code: item.product_code,
              name: item.name,
              description: item.description,
              unit: item.unit,
              weight: item.weight
            })
          }
          
          if (!item.product_code || !item.name) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Faltan campos obligatorios (código o nombre)',
              severity: 'error'
            })
          }
          
          if (!item.weight || item.weight <= 0) {
            item._hasWarning = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Peso inválido o no especificado. Se usará 0.1 kg',
              severity: 'warning'
            })
            item.weight = 0.1
          }
        }
      })
    },

    async confirmImport() {
      this.step = 3
      const validData = this.parsedData.filter(item => !item._hasError)
      this.totalToImport = validData.length
      
      console.log('confirmImport - validData[0]:', validData[0])

      // Crear objetos limpios SOLO con los campos normalizados
      const cleanedData = validData.map(item => {
        if (this.entityName === 'producto') {
          // FORZAR que sean valores simples, no arrays
          return {
            product_code: String(item.product_code || '').trim(),
            name: String(item.name || '').trim(),
            description: String(item.description || '').trim(),
            unit: Number(item.unit) || 2,
            weight: Number(item.weight) || 0.1
          }
        }
        return item
      })

      // Emitir datos limpios para que el componente padre los procese
      this.$emit('import-complete', cleanedData)
      
      // Simular progreso (el padre manejará la importación real)
      this.importedCount = validData.length
      this.importProgress = 100
      
      setTimeout(() => {
        this.close()
      }, 1500)
    },

    // ========== UTILIDADES ==========
    getTimestamp() {
      return new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    },

    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    },

    downloadFile(content, filename, type) {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
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
  backdrop-filter: blur(8px);
}

.import-export-card {
  background: #ffffff;
  border-radius: 16px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.35);
  animation: cardAppear 0.3s ease;
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #E5E7EB;
}

.dialog-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6B7280;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #F3F4F6;
  color: #1F2937;
}

.dialog-content {
  padding: 28px;
}

.description {
  font-size: 15px;
  color: #6B7280;
  margin-bottom: 24px;
}

/* Botones de formato de exportación */
.format-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.format-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  background: #F9FAFB;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.format-btn:hover {
  border-color: #4F6F8F;
  background: #EEF3F9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 111, 143, 0.2);
}

.format-btn .icon {
  font-size: 32px;
}

.format-btn .label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Área de subida de archivos */
.file-upload-area {
  border: 2px dashed #D1D5DB;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #F9FAFB;
  margin-bottom: 20px;
}

.file-upload-area:hover,
.file-upload-area.dragover {
  border-color: #4F6F8F;
  background: #EEF3F9;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #6B7280;
  margin-bottom: 8px;
}

.selected-file {
  font-size: 15px;
  color: #059669;
}

.formats-supported {
  font-size: 13px;
  color: #9CA3AF;
  margin-top: 8px;
}

/* Vista previa */
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.preview-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.btn-secondary-small {
  padding: 8px 16px;
  font-size: 13px;
  background: #F3F4F6;
  border: none;
  border-radius: 8px;
  color: #4B5563;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary-small:hover {
  background: #E5E7EB;
}

/* Errores de validación */
.validation-errors {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.validation-errors h4 {
  font-size: 15px;
  color: #DC2626;
  margin: 0 0 12px;
  font-weight: 600;
}

.error-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-item {
  font-size: 13px;
  color: #991B1B;
}

.error-row {
  font-weight: 600;
  margin-right: 8px;
}

.more-errors {
  font-size: 13px;
  color: #DC2626;
  font-style: italic;
  margin-top: 8px;
}

/* Tabla de vista previa */
.preview-table-container {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin-bottom: 20px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table thead {
  background: #F3F4F6;
  position: sticky;
  top: 0;
  z-index: 1;
}

.preview-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #E5E7EB;
}

.preview-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #F3F4F6;
  color: #6B7280;
}

.row-error {
  background: #FEF2F2;
}

.row-warning {
  background: #FFFBEB;
}

.badge-success,
.badge-warning,
.badge-error {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #D1FAE5;
  color: #059669;
}

.badge-warning {
  background: #FEF3C7;
  color: #D97706;
}

.badge-error {
  background: #FEE2E2;
  color: #DC2626;
}

.preview-note {
  font-size: 13px;
  color: #6B7280;
  text-align: center;
  margin-top: 12px;
}

/* Botones de acción */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #4F6F8F;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3D5A73;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #F3F4F6;
  color: #4B5563;
}

.btn-secondary:hover {
  background: #E5E7EB;
}

/* Paso de importación */
.importing-step {
  text-align: center;
  padding: 40px 20px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #4F6F8F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4F6F8F, #6B8CAE);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #6B7280;
  font-weight: 600;
}

/* Transiciones */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
