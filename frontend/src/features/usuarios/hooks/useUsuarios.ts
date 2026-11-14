import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activarUsuario,
  desactivarUsuario,
  getUsuarios,
} from '../api/usuarios'
import { useAuthStore } from '../../../store/authStore'

export const USUARIOS_KEY = ['admin', 'usuarios'] as const

export function useUsuarios() {
  const usuario = useAuthStore((s) => s.usuario)

  return useQuery({
    queryKey: [...USUARIOS_KEY, usuario?.id ?? 0],
    queryFn: getUsuarios,
    enabled: usuario?.role === 'admin',
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useActivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USUARIOS_KEY })
    },
  })
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USUARIOS_KEY })
    },
  })
}
