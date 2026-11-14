import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumenPedidos,
} from '../api/pedidos'
import type { PedidoFilters } from '../types/pedido'

export function usePedidos(filters: PedidoFilters = {}) {
  return useQuery({
    queryKey: ['pedidos', filters],
    queryFn: () => getPedidos(filters),
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: getResumenPedidos,
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
