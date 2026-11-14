import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activarUsuario,
  desactivarUsuario,
  getUsuarios,
} from '../api/usuarios'

export const USUARIOS_KEY = ['admin', 'usuarios'] as const

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_KEY,
    queryFn: getUsuarios,
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
