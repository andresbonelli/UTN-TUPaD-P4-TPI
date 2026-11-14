import { useState } from 'react'
import type { Producto } from '../types/producto'
import { useCartStore } from '../../../store/cartStore'
import { formatCurrency } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'

interface ProductoCardProps {
  producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar)
  const itemEnCarrito = useCartStore((s) =>
    s.items.find((i) => i.producto_id === producto.id),
  )
  const [imgError, setImgError] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0
  const sinStockDisponible = !producto.disponible || producto.stock <= 0
  const limiteAlcanzado = cantidadEnCarrito >= producto.stock

  const handleAdd = () => {
    agregar(producto, 1)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {producto.imagen_url && !imgError ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Sin imagen
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 shadow-xs">
          {producto.categoria.nombre}
        </span>
        {!producto.disponible && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
            No disponible
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {producto.descripcion}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(producto.precio_base)}
            </span>
            <span
              className={`text-xs font-medium ${
                producto.stock > 0 ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
            </span>
          </div>

          <Button
            onClick={handleAdd}
            disabled={sinStockDisponible || limiteAlcanzado}
            className="w-full"
            variant={justAdded ? 'success' : 'primary'}
          >
            {sinStockDisponible
              ? 'Sin disponibilidad'
              : limiteAlcanzado
                ? `En carrito (${cantidadEnCarrito})`
                : justAdded
                  ? '¡Agregado!'
                  : cantidadEnCarrito > 0
                    ? `Agregar al carrito (${cantidadEnCarrito})`
                    : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
