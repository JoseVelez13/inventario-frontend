/**
 * Utilidad para determinar el estado del stock y su badge correspondiente
 */

export const getStockStatus = (stock, minStock = 10, maxStock = null) => {
  // Convertir a números para evitar problemas de tipos
  const stockNum = parseFloat(stock) || 0
  const minStockNum = parseFloat(minStock) || 10
  const maxStockNum = maxStock !== null && maxStock !== undefined ? parseFloat(maxStock) : null

  if (stockNum === 0 || stock === null || stock === undefined) {
    return {
      variant: 'danger',
      text: 'Agotado',
      icon: '⚠️',
      pulse: true,
      title: 'Stock agotado - Se requiere reabastecimiento urgente'
    }
  }

  if (stockNum <= minStockNum) {
    return {
      variant: 'warning',
      text: 'Stock Bajo',
      icon: '⚡',
      pulse: true,
      title: `Stock bajo - Solo quedan ${stockNum} unidades (mín: ${minStockNum})`
    }
  }

  // Solo mostrar "Sobre Stock" si realmente excede el máximo
  if (maxStockNum !== null && stockNum > maxStockNum) {
    return {
      variant: 'info',
      text: 'Sobre Stock',
      icon: '📦',
      pulse: false,
      title: `Sobre stock - ${stockNum} unidades (máx: ${maxStockNum})`
    }
  }

  if (stockNum <= minStockNum * 2) {
    return {
      variant: 'info',
      text: 'Stock Normal',
      icon: '📦',
      pulse: false,
      title: `Stock normal - ${stockNum} unidades`
    }
  }

  return {
    variant: 'success',
    text: 'Stock Alto',
    icon: '✅',
    pulse: false,
    title: `Stock alto - ${stockNum} unidades`
  }
}

export const getProductStatus = (producto) => {
  // Si el producto tiene una propiedad de estado personalizada
  if (producto.status) {
    const statusMap = {
      'active': { variant: 'success', text: 'Activo', icon: '✓' },
      'inactive': { variant: 'secondary', text: 'Inactivo', icon: '○' },
      'discontinued': { variant: 'danger', text: 'Descontinuado', icon: '×' }
    }
    return statusMap[producto.status] || statusMap['active']
  }
  
  // Por defecto, basado en el stock
  return getStockStatus(producto.stock, producto.stock_min || 10, producto.stock_max)
}

export const getLoteStatus = (lote) => {
  const statusMap = {
    'pending': { variant: 'warning', text: 'Pendiente', icon: '⏳', pulse: false },
    'in_progress': { variant: 'info', text: 'En Proceso', icon: '⚙️', pulse: true },
    'completed': { variant: 'success', text: 'Completado', icon: '✅', pulse: false },
    'cancelled': { variant: 'danger', text: 'Cancelado', icon: '❌', pulse: false }
  }
  
  return statusMap[lote.status] || statusMap['pending']
}

export const getClientStatus = (cliente) => {
  if (cliente.active === false) {
    return { variant: 'secondary', text: 'Inactivo', icon: '○' }
  }
  
  return { variant: 'success', text: 'Activo', icon: '✓' }
}
