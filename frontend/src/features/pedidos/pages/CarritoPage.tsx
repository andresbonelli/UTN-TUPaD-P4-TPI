import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { formatCurrency } from '../../../shared/utils/format'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'

export function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mi carrito</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisá los productos seleccionados antes de confirmar tu pedido.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="secondary" size="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Explorá nuestro catálogo y agregá los platos que quieras pedir."
          accion={
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Ver catálogo
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const subtotal = item.precio_unitario * item.cantidad
              const sinMasStock =
                item.stock !== undefined && item.cantidad >= item.stock
              return (
                <Card
                  key={item.producto_id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {item.imagen_url ? (
                      <img
                        src={item.imagen_url}
                        alt={item.nombre}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 shrink-0">
                        Sin foto
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900">{item.nombre}</h3>
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.precio_unitario)} c/u
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        type="button"
                        onClick={() =>
                          cambiarCantidad(item.producto_id, item.cantidad - 1)
                        }
                        className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200/70 rounded-l-xl cursor-pointer"
                        aria-label="Restar cantidad"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-slate-900 min-w-8 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        disabled={sinMasStock}
                        onClick={() =>
                          cambiarCantidad(item.producto_id, item.cantidad + 1)
                        }
                        className="px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200/70 rounded-r-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Sumar cantidad"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-bold text-slate-900 min-w-24 text-right">
                      {formatCurrency(subtotal)}
                    </p>

                    <button
                      type="button"
                      onClick={() => quitar(item.producto_id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>

          <div>
            <Card className="p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900">Resumen</h2>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Productos ({items.length})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(total)}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Continuar al checkout
              </Button>
              <Link
                to="/"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Seguir agregando productos
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
