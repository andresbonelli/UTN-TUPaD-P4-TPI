import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url?: string
  stock?: number
}

interface ProductoParaCarrito {
  id: number
  nombre: string
  precio_base: number
  imagen_url?: string
  stock?: number
}

interface CartState {
  items: CartItem[]
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto: ProductoParaCarrito, cantidad = 1) => {
        if (cantidad < 1) return
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id)
          const maxStock = producto.stock ?? existente?.stock
          if (existente) {
            const nuevaCantidad = existente.cantidad + cantidad
            const cantidadFinal =
              maxStock !== undefined ? Math.min(nuevaCantidad, maxStock) : nuevaCantidad
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.id
                  ? {
                      ...item,
                      cantidad: cantidadFinal,
                      nombre: producto.nombre,
                      precio_unitario: producto.precio_base,
                      imagen_url: producto.imagen_url,
                      stock: maxStock,
                    }
                  : item,
              ),
            }
          }

          const cantidadInicial =
            maxStock !== undefined ? Math.min(cantidad, maxStock) : cantidad
          if (cantidadInicial < 1) return state

          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: cantidadInicial,
                imagen_url: producto.imagen_url,
                stock: maxStock,
              },
            ],
          }
        })
      },

      quitar: (productoId: number) =>
        set((state) => ({
          items: state.items.filter((item) => item.producto_id !== productoId),
        })),

      cambiarCantidad: (productoId: number, cantidad: number) =>
        set((state) => {
          if (cantidad <= 0) {
            return {
              items: state.items.filter((item) => item.producto_id !== productoId),
            }
          }
          return {
            items: state.items.map((item) => {
              if (item.producto_id !== productoId) return item
              const cantidadFinal =
                item.stock !== undefined ? Math.min(cantidad, item.stock) : cantidad
              return { ...item, cantidad: Math.max(1, cantidadFinal) }
            }),
          }
        }),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    {
      name: 'foodstore-cart',
    },
  ),
)
