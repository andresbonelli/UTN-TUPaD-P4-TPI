import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
  Producto,
  ProductoFilters,
  ProductoPayload,
  ProductosPaginados,
  ProductoStockPayload,
} from '../types/producto'

export async function getProductos(
  filters: ProductoFilters = {},
): Promise<ProductosPaginados> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.skip !== undefined) params.skip = filters.skip
  if (filters.limit !== undefined) params.limit = filters.limit
  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim()
  }
  if (filters.categoria_id !== undefined) {
    params.categoria_id = filters.categoria_id
  }
  if (filters.disponible !== undefined) {
    params.disponible = filters.disponible
  }

  const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
    params,
  })
  return data
}

export async function createProducto(payload: ProductoPayload): Promise<Producto> {
  const { data } = await axiosInstance.post<Producto>('/productos', payload)
  return data
}

export async function updateProducto(params: {
  id: number
  data: Partial<ProductoPayload>
}): Promise<Producto> {
  const { data } = await axiosInstance.put<Producto>(
    `/productos/${params.id}`,
    params.data,
  )
  return data
}

export async function updateProductoStock(params: {
  id: number
  data: ProductoStockPayload
}): Promise<Producto> {
  const { data } = await axiosInstance.patch<Producto>(
    `/productos/${params.id}/stock`,
    params.data,
  )
  return data
}

export async function deleteProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`)
}
