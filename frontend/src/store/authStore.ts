import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from '../features/auth/api/auth'
import type { RegisterPayload, UserPublic } from '../features/auth/types/auth'
import { setUnauthorizedHandler } from '../shared/api/axiosInstance'
import { queryClient } from '../shared/api/queryClient'
import { useCartStore } from './cartStore'

/**
 * Elimina de la caché solo los datos privados de la sesión. El catálogo sigue siendo publico.
 */
function clearPrivateQueries(): void {
  queryClient.removeQueries({ queryKey: ['pedidos'] })
  queryClient.removeQueries({ queryKey: ['admin'] })
}

interface AuthState {
  usuario: UserPublic | null
  cargando: boolean
  login: (username: string, password: string) => Promise<UserPublic>
  register: (payload: RegisterPayload) => Promise<UserPublic>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      clearSession: () => {
        clearPrivateQueries()
        set({ usuario: null, cargando: false })
      },

      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await getMeRequest()
          set({ usuario, cargando: false })
        } catch {
          // Sin sesión (401): no se limpia la caché; el catálogo público sigue cargando
          set({ usuario: null, cargando: false })
        }
      },

      login: async (username: string, password: string) => {
        set({ cargando: true })
        try {
          await loginRequest(username, password)
          const usuario = await getMeRequest()
          // Limpiamos los datos privados para que no queden pedidos de otra sesión
          clearPrivateQueries()
          set({ usuario, cargando: false })
          return usuario
        } catch (error) {
          set({ usuario: null, cargando: false })
          throw error
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ cargando: true })
        try {
          await registerRequest(payload)
          return await get().login(payload.username, payload.password)
        } catch (error) {
          set({ cargando: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await logoutRequest()
        } catch {
          // Limpiamos sesión local incluso si la petición de logout falla
        }
        // Limpiamos datos privados y carrito de compras al cerrar sesión
        clearPrivateQueries()
        useCartStore.getState().vaciar()
        set({ usuario: null, cargando: false })
      },
    }),
    {
      name: 'foodstore-auth',
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)

setUnauthorizedHandler(() => {
  useAuthStore.getState().clearSession()
})
