import axios from 'axios'

interface FastApiValidationItem {
  msg?: unknown
  loc?: unknown
}

/**
 * Extrae un mensaje legible a partir del campo `detail` de FastAPI o de errores de red.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | undefined
    const detail = data?.detail

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (Array.isArray(detail)) {
      const messages = detail.map((item) => {
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as FastApiValidationItem).msg)
        }
        return String(item)
      })
      if (messages.length > 0) {
        return messages.join('. ')
      }
    }

    if (error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.'
    }

    if (error.response) {
      return `Error HTTP ${error.response.status}`
    }

    return error.message || 'Error de comunicación con el servidor'
  }

  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}
