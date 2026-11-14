import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  EstadoPedido,
  Pedido,
  PedidoCreatePayload,
  PedidoFilters,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido'

export async function getPedidos(
  filters: PedidoFilters = {},
): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = {}
  if (filters.skip !== undefined) params.skip = filters.skip
  if (filters.limit !== undefined) params.limit = filters.limit
  if (filters.estado) params.estado = filters.estado

  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', {
    params,
  })
  return data
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
  return data
}

export async function crearPedido(payload: PedidoCreatePayload): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', payload)
  return data
}

export async function cambiarEstadoPedido(params: {
  id: number
  estado: EstadoPedido
}): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(
    `/pedidos/${params.id}/estado`,
    { estado: params.estado },
  )
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}
