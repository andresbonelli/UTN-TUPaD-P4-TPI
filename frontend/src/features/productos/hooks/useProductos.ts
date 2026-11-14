import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateProductoStock,
} from '../api/productos'
import type { ProductoFilters } from '../types/producto'

export function useProductos(filters: ProductoFilters = {}) {
  return useQuery({
    queryKey: ['productos', filters],
    queryFn: () => getProductos(filters),
  })
}

export function useCreateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useUpdateProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useUpdateProductoStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProductoStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useDeleteProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
