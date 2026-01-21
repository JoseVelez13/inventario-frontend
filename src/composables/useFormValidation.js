import { reactive, computed } from 'vue'

export function useFormValidation() {
  const errors = reactive({})

  const hasErrors = computed(() => Object.keys(errors).length > 0)

  /**
   * Validadores reutilizables
   */
  const validators = {
    required: (value, fieldName = 'Este campo') => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} es requerido`
      }
      return null
    },

    minLength: (value, min, fieldName = 'Este campo') => {
      if (value && value.toString().length < min) {
        return `${fieldName} debe tener al menos ${min} caracteres`
      }
      return null
    },

    maxLength: (value, max, fieldName = 'Este campo') => {
      if (value && value.toString().length > max) {
        return `${fieldName} no puede exceder ${max} caracteres`
      }
      return null
    },

    email: (value, fieldName = 'El correo') => {
      if (!value) return null
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return `${fieldName} no es válido`
      }
      return null
    },

    numeric: (value, fieldName = 'Este campo') => {
      if (value === null || value === undefined || value === '') return null
      if (isNaN(value)) {
        return `${fieldName} debe ser un número`
      }
      return null
    },

    minValue: (value, min, fieldName = 'Este campo') => {
      if (value === null || value === undefined || value === '') return null
      if (Number(value) < min) {
        return `${fieldName} debe ser mayor o igual a ${min}`
      }
      return null
    },

    maxValue: (value, max, fieldName = 'Este campo') => {
      if (value === null || value === undefined || value === '') return null
      if (Number(value) > max) {
        return `${fieldName} debe ser menor o igual a ${max}`
      }
      return null
    },

    phone: (value, fieldName = 'El teléfono') => {
      if (!value) return null
      const phoneRegex = /^[0-9\-\+\(\)\s]{7,}$/
      if (!phoneRegex.test(value)) {
        return `${fieldName} no es válido`
      }
      return null
    },

    ruc: (value, fieldName = 'El RUC') => {
      if (!value) return null
      // Validar que sea 13 dígitos
      const rucRegex = /^[0-9]{13}$/
      if (!rucRegex.test(value)) {
        return `${fieldName} debe contener 13 dígitos`
      }
      return null
    },

    alphanumeric: (value, fieldName = 'Este campo') => {
      if (!value) return null
      const alphanumericRegex = /^[a-zA-Z0-9\-_\s]*$/
      if (!alphanumericRegex.test(value)) {
        return `${fieldName} solo puede contener letras, números, guiones y espacios`
      }
      return null
    },

    custom: (value, validatorFn, fieldName = 'Este campo') => {
      if (typeof validatorFn === 'function') {
        return validatorFn(value)
      }
      return null
    }
  }

  /**
   * Validar un campo individual
   */
  const validateField = (fieldName, value, rules = []) => {
    let error = null

    for (const rule of rules) {
      if (typeof rule === 'function') {
        error = rule(value)
      } else if (typeof rule === 'object' && rule.validator) {
        const validator = rule.validator
        const args = rule.args || []
        error = validator(value, ...args)
      }

      if (error) break
    }

    if (error) {
      errors[fieldName] = error
    } else {
      delete errors[fieldName]
    }

    return error
  }

  /**
   * Validar múltiples campos
   */
  const validateForm = (formData, validationRules) => {
    errors[''] = undefined
    Object.keys(errors).forEach(key => delete errors[key])

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = formData[fieldName]
      validateField(fieldName, value, rules)
    }

    return !hasErrors.value
  }

  /**
   * Limpiar errores
   */
  const clearErrors = () => {
    Object.keys(errors).forEach(key => delete errors[key])
  }

  /**
   * Limpiar error de un campo específico
   */
  const clearFieldError = (fieldName) => {
    delete errors[fieldName]
  }

  return {
    errors,
    hasErrors,
    validators,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError
  }
}
