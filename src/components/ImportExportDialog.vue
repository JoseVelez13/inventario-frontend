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
            <button class="format-btn drive" @click="exportarADrive('excel')">
              <span class="icon">
                <i class="fa-brands fa-google-drive"></i>
              </span>
              <span class="label">Google Drive</span>
              <span class="sublabel">Guardar en la nube</span>
            </button>
          </div>
        </div>

        <!-- MODO IMPORTAR -->
        <div v-if="mode === 'import'" class="dialog-content">
          <!-- Paso 1: Seleccionar archivo -->
          <div v-if="step === 1" class="import-step">
            <p class="description">Selecciona un archivo para importar {{ entityName }}s:</p>

            <!-- Botones de descarga de plantillas -->
            <div class="template-download-section">
              <h4 class="template-title">Descargar Plantilla</h4>
              <p class="template-help">
                Descarga la plantilla con las columnas necesarias y ejemplos de datos
              </p>
              <div class="template-buttons">
                <button class="btn-template excel-template" @click="downloadTemplate('excel')">
                  <span class="icon">📊</span>
                  <span class="label">Excel</span>
                </button>
                <button class="btn-template csv-template" @click="downloadTemplate('csv')">
                  <span class="icon">📄</span>
                  <span class="label">CSV</span>
                </button>
                <button class="btn-template json-template" @click="downloadTemplate('json')">
                  <span class="icon">{ }</span>
                  <span class="label">JSON</span>
                </button>
              </div>
            </div>

            <div class="file-upload-area" @click="triggerFileInput" @dragover.prevent="dragover = true"
              @dragleave="dragover = false" @drop.prevent="handleDrop" :class="{ dragover }">
              <input ref="fileInput" type="file" hidden accept=".xlsx,.csv,.json" @change="handleFileSelect">
              <div class="upload-icon">Archivo</div>
              <p v-if="!selectedFile" class="upload-text">
                Haz clic o arrastra un archivo aqui
              </p>
              <p v-else class="selected-file">
                <strong v-text="selectedFile.name"></strong>
                <span v-text="'(' + formatFileSize(selectedFile.size) + ')'"></span>
              </p>
              <p class="formats-supported">Formatos: Excel (.xlsx), CSV (.csv), JSON (.json)</p>
            </div>

            <button v-if="selectedFile" class="btn-primary" @click="processFile">
              Analizar archivo
            </button>
          </div>

          <!-- Paso 2: Vista previa y validacion -->
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
                  ...y {{ validationErrors.length - 5 }} errores mas
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

            <!-- Botones de accion -->
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
      <GuardarDriveModal :isOpen="mostrarModalDrive" :archivo="archivoParaDrive" :nombreArchivo="nombreArchivoParaDrive"
        :tipoReporteDefault="entityName.toLowerCase()" @cerrar="cerrarModalDrive" @guardado="archivoGuardadoEnDrive" />
    </div>
  </transition>
</template>

<script>
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import logo from '../assets/img/logo.png'
import GuardarDriveModal from './GuardarDriveModal.vue'

export default {
  name: 'ImportExportDialog',
  components: {
    GuardarDriveModal
  },
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
    },
    apiEndpoint: {
      type: String,
      default: ''
    }
  },

  emits: ['close', 'import-complete'],

  data() {
    return {
      visible: this.show,
      step: 1, // 1: seleccionar, 2: previa, 3: importando
      selectedFile: null,
      parsedData: [],
      originalColumns: [], // Guardar columnas originales del archivo
      validationErrors: [],
      dragover: false,
      importProgress: 0,
      importedCount: 0,
      totalToImport: 0,
      logoBase64: null,
      mostrarModalDrive: false,
      archivoParaDrive: null,
      nombreArchivoParaDrive: '',
    }
  },

  mounted() {
    this.loadLogoAsBase64()
  },

  computed: {
    previewColumns() {
      // Usar columnas originales si están disponibles, sino usar las del primer item
      if (this.originalColumns.length > 0) return this.originalColumns
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
      this.originalColumns = []
      this.validationErrors = []
      this.importProgress = 0
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    // ========== DESCARGAR PLANTILLA ==========
    async downloadTemplate(format = 'excel') {
      try {
        let templateData = []
        let columnHeaders = []

        // Generar plantilla según el tipo de entidad
        if (this.entityName === 'Productos' || this.entityName === 'producto') {
          columnHeaders = ['Código', 'Nombre', 'Categoría', 'Descripción', 'Unidad', 'Peso', 'Stock']
          templateData = [
            {
              'Código': 'P001',
              'Nombre': 'Jabón Líquido Antibacterial',
              'Categoría': 'Productos de Limpieza',
              'Descripción': 'Jabón líquido para limpieza de manos',
              'Unidad': 'kg',
              'Peso': '1.5',
              'Stock': '100'
            }
          ]
        } else if (this.entityName === 'Clientes' || this.entityName === 'cliente') {
          columnHeaders = ['RUC', 'Nombre Empresa', 'Nombre Contacto', 'Teléfono', 'Email', 'Dirección']
          templateData = [
            {
              'RUC': '1234567890001',
              'Nombre Empresa': 'Distribuidora ABC S.A.',
              'Nombre Contacto': 'Juan Pérez',
              'Teléfono': '0987654321',
              'Email': 'contacto@distribuidoraabc.com',
              'Dirección': 'Av. Principal 123, Quito'
            }
          ]
        } else if (this.entityName === 'Proveedores' || this.entityName === 'proveedor') {
          columnHeaders = ['RUC', 'Nombre Empresa', 'Nombre Contacto', 'Teléfono', 'Email', 'Dirección', 'Tipo Producto']
          templateData = [
            {
              'RUC': '9876543210001',
              'Nombre Empresa': 'Química Industrial XYZ Ltda.',
              'Nombre Contacto': 'María González',
              'Teléfono': '0991234567',
              'Email': 'ventas@quimicaxyz.com',
              'Dirección': 'Parque Industrial Norte, Km 5',
              'Tipo Producto': 'Materias primas químicas'
            }
          ]
        } else if (this.entityName === 'Materias Primas' || this.entityName === 'materia_prima') {
          columnHeaders = ['Código', 'Nombre', 'Categoría', 'Descripción', 'Unidad', 'Densidad', 'Stock Mínimo', 'Stock Máximo']
          templateData = [
            {
              'Código': 'MP001',
              'Nombre': 'Lauril Sulfato de Sodio',
              'Categoría': 'Surfactantes',
              'Descripción': 'Surfactante aniónico para limpieza',
              'Unidad': 'kg',
              'Densidad': '1.2',
              'Stock Mínimo': '100',
              'Stock Máximo': '1000'
            }
          ]
        } else if (this.entityName === 'Almacenes' || this.entityName === 'almacen') {
          columnHeaders = ['Nombre', 'Dirección']
          templateData = [
            {
              'Nombre': 'Bodega Principal',
              'Dirección': 'Parque Industrial Norte, Km 5'
            }
          ]
        } else if (this.entityName === 'Unidades' || this.entityName === 'unidad') {
          columnHeaders = ['Nombre', 'Símbolo', 'Factor de Conversión']
          templateData = [
            {
              'Nombre': 'Kilogramo',
              'Símbolo': 'kg',
              'Factor de Conversión': '1.0'
            },
            {
              'Nombre': 'Gramo',
              'Símbolo': 'g',
              'Factor de Conversión': '0.001'
            }
          ]
        } else {
          columnHeaders = ['Campo1', 'Campo2']
          templateData = [
            {
              'Campo1': 'Ejemplo1',
              'Campo2': 'Ejemplo2'
            }
          ]
        }

        const fileName = `Plantilla_${this.entityName}_${this.getTimestamp()}`

        if (format === 'excel') {
          // Usar ExcelJS para plantilla con estilos profesionales
          const workbook = new ExcelJS.Workbook()
          workbook.creator = 'Sistema Innoquim'
          const worksheet = workbook.addWorksheet('Plantilla')

          // Logo en encabezado
          if (this.logoBase64) {
            try {
              const base64Data = this.logoBase64.split(',')[1]
              const imageId = workbook.addImage({
                base64: base64Data,
                extension: 'png'
              })
              const lastCol = Math.max(0, columnHeaders.length - 1)
              worksheet.addImage(imageId, {
                tl: { col: lastCol, row: 1 },
                ext: { width: 60, height: 60 },
                editAs: 'absolute'
              })
            } catch (err) {
              console.warn('No se pudo agregar logo:', err)
            }
          }

          // Fila 1: TITULO
          worksheet.mergeCells('A1:' + this.getColumnLetter(columnHeaders.length) + '1')
          const titleCell = worksheet.getCell('A1')
          titleCell.value = 'SISTEMA INNOQUIM - PLANTILLA DE IMPORTACIÓN'
          titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } }
          titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F6F8F' } }
          titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
          titleCell.border = {
            top: { style: 'thick', color: { argb: 'FF1E3A5F' } },
            bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } },
            left: { style: 'thick', color: { argb: 'FF1E3A5F' } },
            right: { style: 'thick', color: { argb: 'FF1E3A5F' } }
          }
          worksheet.getRow(1).height = 35

          // Fila 2: SUBTITULO
          worksheet.mergeCells('A2:' + this.getColumnLetter(columnHeaders.length) + '2')
          const subtitleCell = worksheet.getCell('A2')
          subtitleCell.value = 'Plantilla para ' + this.entityName
          subtitleCell.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF2C5F7F' } }
          subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F3F8' } }
          subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
          subtitleCell.border = {
            bottom: { style: 'medium', color: { argb: 'FF4F6F8F' } },
            left: { style: 'thick', color: { argb: 'FF1E3A5F' } },
            right: { style: 'thick', color: { argb: 'FF1E3A5F' } }
          }
          worksheet.getRow(2).height = 50

          // Fila 3: vacia
          worksheet.getRow(3).height = 8

          // Fila 4: INSTRUCCIONES
          worksheet.mergeCells('A4:' + this.getColumnLetter(columnHeaders.length) + '4')
          const instrCell = worksheet.getCell('A4')
          instrCell.value = 'INSTRUCCIONES: Llene los datos a partir de la fila 7. No modifique los encabezados. Elimine la fila de ejemplo antes de importar.'
          instrCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF6B7280' } }
          instrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
          instrCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true }
          instrCell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'medium', color: { argb: 'FFF59E0B' } },
            right: { style: 'medium', color: { argb: 'FFF59E0B' } }
          }
          worksheet.getRow(4).height = 35

          // Fila 5: vacia
          worksheet.getRow(5).height = 8

          // Fila 6: ENCABEZADOS DE COLUMNAS
          const headerRow = worksheet.getRow(6)
          columnHeaders.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1)
            cell.value = header
            cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F6F8F' } }
            cell.alignment = { horizontal: 'center', vertical: 'middle' }
            cell.border = {
              top: { style: 'thick', color: { argb: 'FF2C5F7F' } },
              bottom: { style: 'thick', color: { argb: 'FF2C5F7F' } },
              left: { style: 'medium', color: { argb: 'FFFFFFFF' } },
              right: { style: 'medium', color: { argb: 'FFFFFFFF' } }
            }
          })
          headerRow.height = 28

          // Fila 7: DATOS DE EJEMPLO
          const exampleRow = worksheet.getRow(7)
          columnHeaders.forEach((header, index) => {
            const cell = exampleRow.getCell(index + 1)
            cell.value = templateData[0][header]
            cell.font = { name: 'Arial', size: 10, color: { argb: 'FF6B7280' }, italic: true }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }
            cell.alignment = { horizontal: 'left', vertical: 'middle' }
            cell.border = {
              top: { style: 'hair', color: { argb: 'FFE5E7EB' } },
              bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
              left: { style: 'hair', color: { argb: 'FFE5E7EB' } },
              right: { style: 'hair', color: { argb: 'FFE5E7EB' } }
            }
          })
          exampleRow.height = 20

          // Ajustar anchos de columna
          columnHeaders.forEach((header, index) => {
            const maxLength = Math.max(header.length, String(templateData[0][header]).length)
            worksheet.getColumn(index + 1).width = Math.max(maxLength + 5, 15)
          })

          // Congelar encabezados
          worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 6 }
          ]

          // Establecer que por defecto todas las columnas estén desbloqueadas
          worksheet.columns.forEach(column => {
            column.eachCell({ includeEmpty: false }, (cell) => {
              if (!cell.protection) {
                cell.protection = { locked: false }
              }
            })
          })

          // Bloquear específicamente solo las filas de encabezado (1-6)
          for (let i = 1; i <= 6; i++) {
            const row = worksheet.getRow(i)
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.protection = { locked: true }
            })
          }

          // Asegurar que la fila 7 en adelante estén desbloqueadas
          for (let i = 7; i <= 100; i++) {
            const row = worksheet.getRow(i)
            columnHeaders.forEach((header, colIndex) => {
              const cell = row.getCell(colIndex + 1)
              cell.protection = { locked: false }
            })
          }

          // Activar protección de la hoja
          worksheet.protect('', {
            selectLockedCells: true,
            selectUnlockedCells: true,
            formatCells: true,
            formatColumns: true,
            formatRows: true,
            insertRows: true,
            insertColumns: false,
            deleteRows: true,
            deleteColumns: false,
            sort: true,
            autoFilter: true
          })

          // Guardar archivo
          const buffer = await workbook.xlsx.writeBuffer()
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${fileName}.xlsx`
          link.click()
          window.URL.revokeObjectURL(url)
        } else if (format === 'csv') {
          const csv = Papa.unparse(templateData, {
            quotes: true,
            delimiter: ",",
            header: true
          })
          const BOM = '\uFEFF'
          this.downloadFile(BOM + csv, `${fileName}.csv`, 'text/csv;charset=utf-8')
        } else if (format === 'json') {
          const json = JSON.stringify(templateData, null, 2)
          this.downloadFile(json, `${fileName}.json`, 'application/json')
        }

        console.log(`Plantilla ${format.toUpperCase()} descargada exitosamente`)
      } catch (error) {
        console.error('Error al descargar plantilla:', error)
        alert('Error al generar la plantilla')
      }
    },
    async exportarADrive(formato) {
      try {
        let blob = null
        let fileName = `${this.entityName}_${this.getTimestamp()}`

        if (formato === 'excel') {
          // Generar Excel
          const workbook = new ExcelJS.Workbook()
          workbook.creator = 'Sistema Innoquim'
          const worksheet = workbook.addWorksheet(this.entityName.substring(0, 31))

          // Agregar datos (simplificado, usa tu lógica existente)
          const headerRow = worksheet.getRow(1)
          this.columns.forEach((col, index) => {
            const cell = headerRow.getCell(index + 1)
            cell.value = col.label
          })

          this.data.forEach((item, rowIndex) => {
            const row = worksheet.getRow(2 + rowIndex)
            this.columns.forEach((col, colIndex) => {
              row.getCell(colIndex + 1).value = item[col.key]
            })
          })

          const buffer = await workbook.xlsx.writeBuffer()
          blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          fileName += '.xlsx'
        }
        else if (formato === 'csv') {
          const csv = Papa.unparse(this.data, {
            quotes: true,
            delimiter: ",",
            header: true
          })
          const BOM = '\uFEFF'
          blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
          fileName += '.csv'
        }
        else if (formato === 'json') {
          const json = JSON.stringify(this.data, null, 2)
          blob = new Blob([json], { type: 'application/json' })
          fileName += '.json'
        }
        else if (formato === 'pdf') {
          // Para PDF necesitarías convertir el jsPDF a Blob
          // Por ahora lo dejamos como Excel por defecto
          console.warn('PDF a Drive aún no implementado, usando Excel')
          return this.exportarADrive('excel')
        }

        if (blob) {
          // Convertir Blob a File
          this.archivoParaDrive = new File([blob], fileName, { type: blob.type })
          this.nombreArchivoParaDrive = fileName
          this.mostrarModalDrive = true
        }
      } catch (error) {
        console.error('Error al preparar archivo para Drive:', error)
        alert('Error al preparar el archivo')
      }
    },

    cerrarModalDrive() {
      this.mostrarModalDrive = false
      this.archivoParaDrive = null
      this.nombreArchivoParaDrive = ''
    },

    archivoGuardadoEnDrive(resultado) {
      console.log('Archivo guardado en Drive:', resultado)
      // Opcional: Cerrar el diálogo principal después de guardar
      this.close()
    },
    // ========== EXPORTAR ==========
    async exportExcel() {
      try {
        // Crear un nuevo libro de Excel con ExcelJS
        const workbook = new ExcelJS.Workbook()

        // Configurar propiedades del documento
        workbook.creator = 'Sistema Innoquim'
        workbook.lastModifiedBy = 'Sistema Innoquim'
        workbook.created = new Date()
        workbook.modified = new Date()

        // Crear hoja
        const worksheet = workbook.addWorksheet(this.entityName.substring(0, 31))

        // ===== AGREGAR LOGO EN ENCABEZADO (ESQUINA DERECHA) =====
        if (this.logoBase64) {
          try {
            const base64Data = this.logoBase64.split(',')[1]
            const imageId = workbook.addImage({
              base64: base64Data,
              extension: 'png'
            })

            // Logo pequeño en la esquina derecha de la fila 2
            const lastCol = Math.max(0, this.columns.length - 1)
            worksheet.addImage(imageId, {
              tl: { col: lastCol, row: 1 },
              ext: { width: 60, height: 60 },
              editAs: 'absolute'
            })
          } catch (err) {
            console.warn('No se pudo agregar logo en Excel:', err)
          }
        }

        const now = new Date()
        const fechaHora = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        // ===== TITULO PRINCIPAL (Fila 1) =====
        worksheet.mergeCells('A1:' + this.getColumnLetter(this.columns.length) + '1')
        const titleCell = worksheet.getCell('A1')
        titleCell.value = 'SISTEMA INNOQUIM'
        titleCell.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFFFFFF' } }
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F6F8F' } }
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
        titleCell.border = {
          top: { style: 'thick', color: { argb: 'FF1E3A5F' } },
          bottom: { style: 'medium', color: { argb: 'FF1E3A5F' } },
          left: { style: 'thick', color: { argb: 'FF1E3A5F' } },
          right: { style: 'thick', color: { argb: 'FF1E3A5F' } }
        }
        worksheet.getRow(1).height = 35

        // ===== SUBTITULO (Fila 2) =====
        worksheet.mergeCells('A2:' + this.getColumnLetter(this.columns.length) + '2')
        const subtitleCell = worksheet.getCell('A2')
        subtitleCell.value = 'Reporte de ' + this.entityName
        subtitleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF2C5F7F' } }
        subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F3F8' } }
        subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' }
        subtitleCell.border = {
          bottom: { style: 'medium', color: { argb: 'FF4F6F8F' } },
          left: { style: 'thick', color: { argb: 'FF1E3A5F' } },
          right: { style: 'thick', color: { argb: 'FF1E3A5F' } }
        }
        worksheet.getRow(2).height = 50

        // Fila 3 vacia
        worksheet.getRow(3).height = 8

        // ===== INFORMACION (Filas 4-6) =====
        const infoData = [
          ['Fecha de exportacion:', fechaHora],
          ['Total de registros:', this.data.length],
          ['Generado por:', 'Sistema de Gestion de Inventario - Innoquim']
        ]

        infoData.forEach((info, index) => {
          const rowNum = 4 + index
          const labelCell = worksheet.getCell('A' + rowNum)
          const valueCell = worksheet.getCell('B' + rowNum)

          labelCell.value = info[0]
          labelCell.font = { bold: true, size: 10, color: { argb: 'FF4F6F8F' } }
          labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } }
          labelCell.alignment = { horizontal: 'right', vertical: 'middle' }
          labelCell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'medium', color: { argb: 'FF4F6F8F' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          }

          valueCell.value = info[1]
          valueCell.font = { size: 10, color: { argb: 'FF1F2937' } }
          valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
          valueCell.alignment = { horizontal: 'left', vertical: 'middle' }
          valueCell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'medium', color: { argb: 'FF4F6F8F' } }
          }

          // Fusionar desde B hasta la ultima columna de datos
          const endCol = this.getColumnLetter(this.columns.length)
          worksheet.mergeCells('B' + rowNum + ':' + endCol + rowNum)

          worksheet.getRow(rowNum).height = 20
        })

        // Filas 7-8 vacias
        worksheet.getRow(7).height = 8
        worksheet.getRow(8).height = 8

        // ===== HEADERS DE DATOS (Fila 9) =====
        const headerRow = worksheet.getRow(9)
        this.columns.forEach((col, index) => {
          const cell = headerRow.getCell(index + 1)
          cell.value = col.label
          cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F6F8F' } }
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.border = {
            top: { style: 'thick', color: { argb: 'FF2C5F7F' } },
            bottom: { style: 'thick', color: { argb: 'FF2C5F7F' } },
            left: { style: 'medium', color: { argb: 'FFFFFFFF' } },
            right: { style: 'medium', color: { argb: 'FFFFFFFF' } }
          }
        })
        headerRow.height = 28

        // ===== DATOS (Desde fila 10) =====
        this.data.forEach((item, rowIndex) => {
          const row = worksheet.getRow(10 + rowIndex)
          const isEven = rowIndex % 2 === 0
          const bgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC'

          this.columns.forEach((col, colIndex) => {
            const cell = row.getCell(colIndex + 1)
            const value = item[col.key]
            cell.value = value !== undefined && value !== null ? value : '-'
            cell.font = { size: 10, color: { argb: 'FF1F2937' } }
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
            cell.alignment = { horizontal: 'left', vertical: 'middle' }
            cell.border = {
              top: { style: 'hair', color: { argb: 'FFE5E7EB' } },
              bottom: { style: 'hair', color: { argb: 'FFE5E7EB' } },
              left: { style: 'hair', color: { argb: 'FFE5E7EB' } },
              right: { style: 'hair', color: { argb: 'FFE5E7EB' } }
            }
          })
        })

        // ===== AJUSTAR ANCHOS DE COLUMNA =====
        this.columns.forEach((col, index) => {
          let maxLength = col.label.length
          if (index === 0) {
            worksheet.getColumn(index + 1).width = 30
          } else if (index === this.columns.length - 1) {
            // Ultima columna mas ancha para el logo
            this.data.slice(0, 100).forEach(item => {
              const value = String(item[col.key] || '')
              maxLength = Math.max(maxLength, value.length)
            })
            worksheet.getColumn(index + 1).width = Math.max(Math.min(Math.max(maxLength + 2, 15), 50), 12)
          } else {
            this.data.slice(0, 100).forEach(item => {
              const value = String(item[col.key] || '')
              maxLength = Math.max(maxLength, value.length)
            })
            worksheet.getColumn(index + 1).width = Math.min(Math.max(maxLength + 2, 15), 50)
          }
        })

        // ===== AUTO-FILTRO =====
        worksheet.autoFilter = {
          from: { row: 9, column: 1 },
          to: { row: 9, column: this.columns.length }
        }

        // ===== CONGELAR PANELES =====
        worksheet.views = [
          { state: 'frozen', xSplit: 0, ySplit: 9 }
        ]

        // ===== GUARDAR ARCHIVO =====
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = this.entityName + '_' + this.getTimestamp() + '.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)

        this.close()
      } catch (error) {
        console.error('Error al exportar Excel:', error)
        alert('Error al generar el archivo Excel')
      }
    },

    exportCSV() {
      try {
        const now = new Date()
        const fechaHora = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        // BOM para correcta visualizacion en Excel
        const BOM = '\uFEFF'
        let csvContent = BOM

        // Encabezados simples
        csvContent += this.columns.map(col => '"' + col.label + '"').join(',') + '\n'

        // Datos
        this.data.forEach((item) => {
          csvContent += this.columns.map(col => {
            const value = item[col.key]
            const finalValue = value !== undefined && value !== null ? String(value) : ''
            return '"' + finalValue.replace(/"/g, '""') + '"'
          }).join(',') + '\n'
        })

        // Descargar archivo
        this.downloadFile(csvContent, this.entityName + '_' + this.getTimestamp() + '.csv', 'text/csv;charset=utf-8')
        this.close()
      } catch (error) {
        console.error('Error al exportar CSV:', error)
        alert('Error al generar el archivo CSV')
      }
    },

    exportJSON() {
      try {
        const now = new Date()
        const fechaHora = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        const exportData = {
          system: "SISTEMA INNOQUIM",
          entity: this.entityName,
          exportDate: fechaHora,
          totalRecords: this.data.length,
          columns: this.columns.map(col => ({
            key: col.key,
            label: col.label
          })),
          data: this.data
        }
        const json = JSON.stringify(exportData, null, 2)
        this.downloadFile(json, `${this.entityName}_${this.getTimestamp()}.json`, 'application/json')
        this.close()
      } catch (error) {
        console.error('Error al exportar JSON:', error)
        alert('Error al generar el archivo JSON')
      }
    },

    exportPDF() {
      try {
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        })

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()

        // ===== ENCABEZADO ESTILO EXCEL =====

        // Fila 1: TITULO PRINCIPAL (azul oscuro)
        doc.setFillColor(79, 111, 143)
        doc.rect(0, 0, pageWidth, 12, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.setFont('helvetica', 'bold')
        doc.text('SISTEMA INNOQUIM', pageWidth / 2, 8, { align: 'center' })

        // Fila 2: SUBTITULO (celeste)
        doc.setFillColor(232, 243, 248)
        doc.rect(0, 12, pageWidth, 10, 'F')
        doc.setTextColor(44, 95, 127)
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.text('Reporte de ' + this.entityName, pageWidth / 2, 18.5, { align: 'center' })

        // Logo en fila 2 (esquina derecha, más grande)
        if (this.logoBase64) {
          try {
            doc.addImage(this.logoBase64, 'PNG', pageWidth - 30, 13, 26, 13)
          } catch (err) {
            console.warn('Error al agregar logo en encabezado:', err)
          }
        }

        // Fila 3: espacio vacio
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 22, pageWidth, 3, 'F')

        // Filas 4-6: INFORMACION (estilo Excel con etiquetas)
        doc.setTextColor(79, 111, 143)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')

        const now = new Date()
        const fechaHora = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

        // Fila 4: Fecha de exportacion
        doc.setFillColor(240, 244, 248)
        doc.rect(14, 25, 55, 6, 'F')
        doc.text('Fecha de exportacion:', 68, 29, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(31, 41, 55)
        doc.text(fechaHora, 70, 29)

        // Fila 5: Total de registros
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(79, 111, 143)
        doc.setFillColor(240, 244, 248)
        doc.rect(14, 31, 55, 6, 'F')
        doc.text('Total de registros:', 68, 35, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(31, 41, 55)
        doc.text(String(this.data.length), 70, 35)

        // Fila 6: Generado por
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(79, 111, 143)
        doc.setFillColor(240, 244, 248)
        doc.rect(14, 37, 55, 6, 'F')
        doc.text('Generado por:', 68, 41, { align: 'right' })
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(31, 41, 55)
        doc.text('Sistema de Gestion de Inventario - Innoquim', 70, 41)

        // Preparar datos de la tabla
        const tableData = this.data.map(item =>
          this.columns.map(col => {
            const value = item[col.key]
            if (value === null || value === undefined) return '-'
            if (typeof value === 'number') return String(value)
            return String(value)
          })
        )
        const headers = this.columns.map(col => col.label)

        // Generar tabla con estilos mejorados
        autoTable(doc, {
          head: [headers],
          body: tableData,
          startY: 48,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak',
            halign: 'left',
            font: 'helvetica'
          },
          headStyles: {
            fillColor: [79, 111, 143],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250]
          },
          columnStyles: {
            0: { fontStyle: 'bold' }
          },
          margin: { left: 14, right: 14 },
          didDrawPage: function (data) {
            // Pie de página
            const pageCount = doc.internal.getNumberOfPages()
            const pageNumber = doc.internal.getCurrentPageInfo().pageNumber

            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.setFont('helvetica', 'normal')

            doc.text(
              'Pagina ' + pageNumber + ' de ' + pageCount,
              14,
              doc.internal.pageSize.height - 10
            )

            doc.text(
              'Sistema de Gestion de Inventario - Innoquim',
              doc.internal.pageSize.width / 2,
              doc.internal.pageSize.height - 10,
              { align: 'center' }
            )
          }
        })

        doc.save(`${this.entityName}_${this.getTimestamp()}.pdf`)
        this.close()
      } catch (error) {
        console.error('Error al exportar PDF:', error)
        console.error('Detalles del error:', error.message, error.stack)
        alert(`Error al generar el archivo PDF: ${error.message}`)
      }
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

            // Verificar si es una plantilla de Innoquim (tiene encabezados decorativos)
            const cellA1 = firstSheet['A1']
            const isInnoquimTemplate = cellA1 && cellA1.v && cellA1.v.toString().includes('SISTEMA INNOQUIM')

            if (isInnoquimTemplate) {
              // Plantilla profesional: headers en fila 6 (índice 5), datos desde fila 7 (índice 6)
              // Primero obtener los headers de la fila 6
              const headerRange = XLSX.utils.decode_range(firstSheet['!ref'])
              const headers = []
              for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col }) // Fila 6 (0-indexed)
                const cell = firstSheet[cellAddress]
                headers.push(cell ? cell.v : `Column${col}`)
              }

              // Luego obtener los datos desde la fila 7 usando esos headers
              this.parsedData = XLSX.utils.sheet_to_json(firstSheet, {
                range: 6, // Empezar desde fila 7 (0-indexed)
                header: headers, // Usar los headers de la fila 6
                defval: '' // Valor por defecto para celdas vacías
              })
            } else {
              // Plantilla simple o archivo externo: primera fila son headers
              this.parsedData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' })
            }

            
            // IMPORTANTE: Normalizar y mapear columnas para mantener consistencia
            // Esto asegura que "Categoría", "categoria", "category" todas se encuentren como "categoria"
            this.parsedData = this.parsedData.map(row => {
              const normalizedRow = {}
              
              // Crear un mapa de claves normalizadas para referencia rápida
              const keyMap = {}
              for (const key of Object.keys(row)) {
                const normalizedKey = key.toLowerCase().trim()
                keyMap[normalizedKey] = key
              }
              
              // Re-mapear todas las claves a su forma normalizada (minúsculas, sin espacios extra)
              for (const key of Object.keys(row)) {
                const normalizedKey = key.toLowerCase().trim()
                normalizedRow[normalizedKey] = row[key]
              }
              
              return normalizedRow
            })
            
            // Guardar las columnas originales del archivo
            if (this.parsedData.length > 0) {
              this.originalColumns = Object.keys(this.parsedData[0]).filter(k => !k.startsWith('_'))
            }

            console.log('Excel parseado:', this.parsedData.length, 'filas')
            console.log('Primera fila (normalizada):', this.parsedData[0])
            console.log('Columnas originales (normalizadas):', this.originalColumns)
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
            
            // IMPORTANTE: Normalizar y mapear columnas igual que en parseExcel()
            this.parsedData = this.parsedData.map(row => {
              const normalizedRow = {}
              
              // Re-mapear todas las claves a su forma normalizada (minúsculas, sin espacios extra)
              for (const key of Object.keys(row)) {
                const normalizedKey = key.toLowerCase().trim()
                normalizedRow[normalizedKey] = row[key]
              }
              
              return normalizedRow
            })
            
            console.log('CSV parseado:', this.parsedData.length, 'filas')
            console.log('Primera fila (normalizada):', this.parsedData[0])
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
            
            // IMPORTANTE: Normalizar y mapear columnas igual que en parseExcel()
            this.parsedData = this.parsedData.map(row => {
              const normalizedRow = {}
              
              // Re-mapear todas las claves a su forma normalizada (minúsculas, sin espacios extra)
              for (const key of Object.keys(row)) {
                const normalizedKey = key.toLowerCase().trim()
                normalizedRow[normalizedKey] = row[key]
              }
              
              return normalizedRow
            })
            
            console.log('JSON parseado:', this.parsedData.length, 'filas')
            console.log('Primera fila (normalizada):', this.parsedData[0])
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
        if (this.entityName === 'Productos' || this.entityName === 'producto') {
          // Buscar columnas de forma flexible (case-insensitive y sin espacios)
          const findValue = (possibleNames) => {
            for (const key of Object.keys(item)) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
              for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
                if (normalizedKey === normalizedName) {
                  return item[key]
                }
              }
            }
            return ''
          }

          // Extraer valores flexiblemente
          const codigoValue = findValue(['Código', 'codigo', 'code', 'product_code', 'productcode'])
          const nombreValue = findValue(['Nombre', 'nombre', 'name', 'producto'])
          const descripcionValue = findValue(['Descripción', 'Descripcion', 'descripcion', 'description'])
          const categoriaValue = findValue(['Categoría', 'categoria', 'Category', 'category'])
          const unidadValue = findValue(['Unidad', 'unidad', 'unit', 'UnidaddeMedida', 'unidad_medida'])
          const pesoValue = findValue(['Peso', 'peso', 'weight', 'Peso(kg)'])

          // Guardar valores normalizados
          item._normalized = {
            product_code: codigoValue || '',
            name: nombreValue || '',
            description: descripcionValue || '',
            category: categoriaValue || '',
            unit: (unidadValue || 'kg').toString().trim(),
            weight: parseFloat(pesoValue) || 0.1
          }

          if (idx === 0) {
            console.log('validateData - primera fila después de normalizar:', item._normalized)
          }

          if (!item._normalized.product_code || !item._normalized.name) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Faltan campos obligatorios (código o nombre)',
              severity: 'error'
            })
          }

          if (!item._normalized.weight || item._normalized.weight <= 0) {
            item._hasWarning = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Peso inválido o no especificado. Se usará 0.1 kg',
              severity: 'warning'
            })
            item._normalized.weight = 0.1
          }
        }
        else if (this.entityName === 'Clientes' || this.entityName === 'cliente') {
          // Debug: ver qué columnas tiene realmente el item
          if (idx === 0 || idx === 1) {
            console.log(`Fila ${idx + 1} - Columnas disponibles:`, Object.keys(item))
            console.log(`Fila ${idx + 1} - Valores:`, item)
          }

          // Buscar columnas de forma flexible (case-insensitive y sin espacios)
          const findValue = (possibleNames) => {
            for (const key of Object.keys(item)) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
              for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
                if (normalizedKey === normalizedName) {
                  return item[key]
                }
              }
            }
            return ''
          }

          // Normalizar campos de clientes buscando flexiblemente
          const rucValue = findValue(['RUC', 'ruc', 'Ruc'])
          const empresaValue = findValue(['Nombre Empresa', 'nombre_empresa', 'Empresa', 'empresa', 'NombreEmpresa'])
          const contactoValue = findValue(['Nombre Contacto', 'nombre_contacto', 'Contacto', 'contacto', 'NombreContacto'])
          const telefonoValue = findValue(['Teléfono', 'Telefono', 'telefono', 'phone', 'Phone'])
          const emailValue = findValue(['Email', 'email', 'correo', 'Correo'])
          const direccionValue = findValue(['Dirección', 'Direccion', 'direccion', 'address', 'Address'])

          // Agregar campos normalizados (para la importación posterior)
          item._normalized = {
            ruc: rucValue,
            nombre_empresa: empresaValue,
            nombre_contacto: contactoValue,
            telefono: telefonoValue,
            email: emailValue,
            direccion: direccionValue
          }

          console.log(`Fila ${idx + 1} - Normalizado:`, item._normalized)

          if (!rucValue || !empresaValue) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Faltan campos obligatorios (RUC o Empresa)',
              severity: 'error'
            })
          }
        }
        else if (this.entityName === 'Proveedores' || this.entityName === 'proveedor') {
          // Buscar columnas de forma flexible
          const findValue = (possibleNames) => {
            for (const key of Object.keys(item)) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
              for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
                if (normalizedKey === normalizedName) {
                  return item[key]
                }
              }
            }
            return ''
          }

          // Normalizar campos de proveedores
          const rucValue = findValue(['RUC', 'ruc', 'Ruc'])
          const empresaValue = findValue(['Nombre Empresa', 'nombre_empresa', 'Empresa', 'empresa', 'NombreEmpresa'])
          const contactoValue = findValue(['Nombre Contacto', 'nombre_contacto', 'Contacto', 'contacto', 'NombreContacto'])
          const telefonoValue = findValue(['Teléfono', 'Telefono', 'telefono', 'phone', 'Phone'])
          const emailValue = findValue(['Email', 'email', 'correo', 'Correo'])
          const direccionValue = findValue(['Dirección', 'Direccion', 'direccion', 'address', 'Address'])
          const tipoProductoValue = findValue(['Tipo Producto', 'TipoProducto', 'tipo_producto', 'TipodeProducto'])

          // Agregar campos normalizados
          item._normalized = {
            ruc: rucValue,
            nombre_empresa: empresaValue,
            nombre_contacto: contactoValue,
            telefono: telefonoValue,
            email: emailValue,
            direccion: direccionValue,
            tipo_producto: tipoProductoValue
          }

          if (!rucValue || !empresaValue) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Faltan campos obligatorios (RUC o Empresa)',
              severity: 'error'
            })
          }
        }
        else if (this.entityName === 'Almacenes' || this.entityName === 'almacen') {
          // Buscar columnas de forma flexible
          const findValue = (possibleNames) => {
            for (const key of Object.keys(item)) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
              for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
                if (normalizedKey === normalizedName) {
                  return item[key]
                }
              }
            }
            return ''
          }

          // Normalizar campos de almacenes
          const nombreValue = findValue(['Nombre', 'nombre', 'name', 'NombreAlmacén', 'NombreAlmacen'])
          const direccionValue = findValue(['Dirección', 'Direccion', 'direccion', 'address', 'Address'])

          // Agregar campos normalizados
          item._normalized = {
            nombre: nombreValue,
            direccion: direccionValue
          }

          if (!nombreValue) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Falta campo obligatorio (Nombre)',
              severity: 'error'
            })
          }
        }
        else if (this.entityName === 'Unidades' || this.entityName === 'unidad') {
          // Buscar columnas de forma flexible
          const findValue = (possibleNames) => {
            for (const key of Object.keys(item)) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
              for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
                if (normalizedKey === normalizedName) {
                  return item[key]
                }
              }
            }
            return ''
          }

          // Normalizar campos de unidades
          const nombreValue = findValue(['Nombre', 'nombre', 'name'])
          const simboloValue = findValue(['Símbolo', 'Simbolo', 'simbolo', 'symbol', 'Symbol'])
          const factorValue = findValue(['FactordeConversión', 'FactordeConversion', 'factor_conversion', 'factor'])

          // Agregar campos normalizados
          item._normalized = {
            nombre: nombreValue,
            simbolo: simboloValue,
            factor_conversion: parseFloat(factorValue) || null
          }

          if (!nombreValue || !simboloValue) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Faltan campos obligatorios (Nombre o Símbolo)',
              severity: 'error'
            })
          }
        }
        else if (this.entityName === 'Materias Primas' || this.entityName === 'materia_prima') {
          // Buscar columnas de forma flexible
          const findValue = (possibleNames) => {
            for (const key of Object.keys(item)) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
              for (const name of possibleNames) {
                const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íìî]/g, 'i').replace(/[óòô]/g, 'o').replace(/[úùû]/g, 'u')
                if (normalizedKey === normalizedName) {
                  return item[key]
                }
              }
            }
            return ''
          }

          // Extraer valores flexiblemente
          const codigoValue = findValue(['Código', 'codigo', 'code'])
          const nombreValue = findValue(['Nombre', 'nombre', 'name'])
          const descripcionValue = findValue(['Descripción', 'Descripcion', 'descripcion', 'description'])
          const categoriaValue = findValue(['Categoría', 'categoria', 'Category', 'category'])
          const unidadValue = findValue(['Unidad', 'unidad', 'unit'])
          const densidadValue = findValue(['Densidad', 'densidad', 'density', 'Densidad(g/cm³)'])
          const stockMinValue = findValue(['StockMínimo', 'StockMinimo', 'stock_minimo', 'min_stock'])
          const stockMaxValue = findValue(['StockMáximo', 'StockMaximo', 'stock_maximo', 'max_stock'])

          // Guardar valores normalizados (unidad como texto para luego convertir a ID)
          item._normalized = {
            codigo: codigoValue || '',
            nombre: nombreValue || '',
            descripcion: descripcionValue || '',
            categoria: categoriaValue || '',
            unidad_text: (unidadValue || 'kg').toString().trim(),
            densidad: parseFloat(densidadValue) || 0,
            stock_minimo: parseInt(stockMinValue) || 0,
            stock_maximo: parseInt(stockMaxValue) || 0
          }

          if (idx === 0) {
            console.log('validateData - materia prima normalizada:', item._normalized)
          }

          if (!item._normalized.codigo || !item._normalized.nombre) {
            item._hasError = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Faltan campos obligatorios (código o nombre)',
              severity: 'error'
            })
          }

          if (!item._normalized.stock_minimo || item._normalized.stock_minimo <= 0) {
            item._hasWarning = true
            this.validationErrors.push({
              row: rowNum,
              message: 'Stock mínimo no especificado. Se usará 0',
              severity: 'warning'
            })
            item._normalized.stock_minimo = 0
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
        if (this.entityName === 'Productos' || this.entityName === 'producto') {
          // Usar los campos normalizados del objeto _normalized
          const normalized = item._normalized || {}
          return {
            product_code: String(normalized.product_code || '').trim(),
            name: String(normalized.name || '').trim(),
            description: String(normalized.description || '').trim(),
            category: String(normalized.category || '').trim(),
            unit: String(normalized.unit || 'kg').trim(),
            weight: parseFloat(normalized.weight) || 0.1
          }
        }
        else if (this.entityName === 'Clientes' || this.entityName === 'cliente') {
          // Usar los campos normalizados del objeto _normalized
          const normalized = item._normalized || {}
          return {
            ruc: String(normalized.ruc || '').trim(),
            nombre_empresa: String(normalized.nombre_empresa || '').trim(),
            nombre_contacto: String(normalized.nombre_contacto || '').trim(),
            telefono: String(normalized.telefono || '').trim(),
            email: String(normalized.email || '').trim(),
            direccion: String(normalized.direccion || '').trim()
          }
        }
        else if (this.entityName === 'Proveedores' || this.entityName === 'proveedor') {
          // Usar los campos normalizados del objeto _normalized
          const normalized = item._normalized || {}
          return {
            ruc: String(normalized.ruc || '').trim(),
            nombre_empresa: String(normalized.nombre_empresa || '').trim(),
            nombre_contacto: String(normalized.nombre_contacto || '').trim(),
            telefono: String(normalized.telefono || '').trim(),
            email: String(normalized.email || '').trim(),
            direccion: String(normalized.direccion || '').trim(),
            tipo_producto: String(normalized.tipo_producto || '').trim()
          }
        }
        else if (this.entityName === 'Almacenes' || this.entityName === 'almacen') {
          // Usar los campos normalizados del objeto _normalized
          const normalized = item._normalized || {}
          return {
            nombre: String(normalized.nombre || '').trim(),
            direccion: String(normalized.direccion || '').trim()
          }
        }
        else if (this.entityName === 'Unidades' || this.entityName === 'unidad') {
          // Usar los campos normalizados del objeto _normalized
          const normalized = item._normalized || {}
          return {
            nombre: String(normalized.nombre || '').trim(),
            simbolo: String(normalized.simbolo || '').trim(),
            factor_conversion: parseFloat(normalized.factor_conversion) || null
          }
        }
        else if (this.entityName === 'Materias Primas' || this.entityName === 'materia_prima') {
          // Usar los campos normalizados del objeto _normalized
          const normalized = item._normalized || {}
          return {
            codigo: String(normalized.codigo || '').trim(),
            nombre: String(normalized.nombre || '').trim(),
            descripcion: String(normalized.descripcion || '').trim(),
            categoria: String(normalized.categoria || '').trim(),
            unidad_text: String(normalized.unidad_text || 'kg').trim(),
            densidad: parseFloat(normalized.densidad) || 0,
            stock_minimo: parseInt(normalized.stock_minimo) || 0,
            stock_maximo: parseInt(normalized.stock_maximo) || 0
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

    getColumnLetter(colNumber) {
      let letter = ''
      while (colNumber > 0) {
        const remainder = (colNumber - 1) % 26
        letter = String.fromCharCode(65 + remainder) + letter
        colNumber = Math.floor((colNumber - 1) / 26)
      }
      return letter
    },

    loadLogoAsBase64() {
      const img = new Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.logoBase64 = canvas.toDataURL('image/png')
          console.log('✅ Logo cargado como base64')
        } catch (err) {
          console.error('Error al convertir logo:', err)
        }
      }
      img.onerror = (err) => {
        console.error('Error al cargar logo:', err)
      }
      img.src = logo
    },

    downloadFile(content, filename, type) {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
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

.format-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.format-btn.drive {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #4285f4 0%, #34a853 100%);
  border-color: #4285f4;
  color: white;
  position: relative;
}

.format-btn.drive .icon {
  font-size: 28px;
  color: white;
}

.format-btn.drive .label {
  color: white;
  font-weight: 700;
}

.format-btn.drive .sublabel {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  margin-top: 4px;
}

.format-btn.drive:hover {
  background: linear-gradient(135deg, #3b78e7 0%, #2d9348 100%);
  border-color: #3b78e7;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(66, 133, 244, 0.4);
}

.format-btn.drive::before {
  content: '☁️';
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 20px;
  opacity: 0.3;
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

/* Sección de descarga de plantilla */
.template-download-section {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border: 1px solid #BFDBFE;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: center;
}

.template-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1E40AF;
}

.template-help {
  font-size: 13px;
  color: #1E40AF;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.template-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.btn-template {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid transparent;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.btn-template .icon {
  font-size: 28px;
}

.btn-template .label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.excel-template {
  border-color: #10B981;
}

.excel-template:hover {
  background: #D1FAE5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.csv-template {
  border-color: #F59E0B;
}

.csv-template:hover {
  background: #FEF3C7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.json-template {
  border-color: #3B82F6;
}

.json-template .icon {
  color: #3B82F6;
  font-weight: bold;
}

.json-template:hover {
  background: #DBEAFE;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-template:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .template-buttons {
    grid-template-columns: 1fr;
  }
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
  to {
    transform: rotate(360deg);
  }
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
