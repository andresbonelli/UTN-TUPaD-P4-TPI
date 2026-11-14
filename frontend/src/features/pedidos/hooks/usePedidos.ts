import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos'
import type { PedidoFilters } from '../types/pedido'
import { useAuthStore } from '../../../store/authStore'

export function usePedidos(filters: PedidoFilters = {}) {
  const usuario = useAuthStore((s) => s.usuario)

  return useQuery({
    queryKey: ['pedidos', usuario?.role ?? 'anon', usuario?.id ?? 0, filters],
    queryFn: () => getPedidos(filters),
    enabled: !!usuario,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useResumenPedidos() {
  const usuario = useAuthStore((s) => s.usuario)

  return useQuery({
    queryKey: ['pedidos', 'resumen', usuario?.id ?? 0],
    queryFn: getResumenPedidos,
    enabled: usuario?.role === 'admin',
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cambiarEstadoPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
