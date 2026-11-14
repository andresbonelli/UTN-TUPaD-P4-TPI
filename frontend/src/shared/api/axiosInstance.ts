import axios from 'axios'
import type { AxiosError } from 'axios'
import { handleApiError } from './handleApiError'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

let onUnauthorizedCallback: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorizedCallback = handler
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status
    const requestUrl = error.config?.url ?? ''
    const isAuthEntrypoint =
      requestUrl.includes('/auth/token') || requestUrl.includes('/auth/me')
    const message = handleApiError(error)

    if (
      (status === 401 && !isAuthEntrypoint) ||
      (status === 400 && message === 'Cuenta de usuario desactivada')
    ) {
      onUnauthorizedCallback?.()
    }

    const normalized = new Error(message)
    normalized.cause = error
    return Promise.reject(normalized)
  },
)
