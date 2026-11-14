import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from '../api/categorias'

export const CATEGORIAS_KEY = ['categorias'] as const

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_KEY,
    queryFn: getCategorias,
  })
}

export function useCreateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY })
    },
  })
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY })
      void queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_KEY })
    },
  })
}
