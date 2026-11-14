import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/usePedidos'
import type { FormaPago } from '../types/pedido'
import { formatCurrency } from '../../../shared/utils/format'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const vaciar = useCartStore((s) => s.vaciar)
  const total = useCartStore((s) => s.total())
  const crearPedidoMutation = useCrearPedido()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null)
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim(),
        })
        vaciar()
        navigate('/mis-pedidos', { replace: true })
      } catch (err) {
        setServerError(
          err instanceof Error
            ? err.message
            : 'No se pudo confirmar el pedido',
        )
      }
    },
  })

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="No hay productos para confirmar"
        descripcion="Agregá platos al carrito antes de realizar el checkout."
        accion={
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirmar pedido</h1>
        <p className="text-sm text-slate-500 mt-1">
          Completá los datos de entrega y elegí cómo querés pagar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          {serverError && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
              {serverError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
            className="space-y-5"
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const cleaned = value.trim()
                  if (cleaned.length < 5 || cleaned.length > 200) {
                    return 'La dirección debe tener entre 5 y 200 caracteres'
                  }
                  return undefined
                },
              }}
            >
              {(field) => (
                <Input
                  id="checkout-direccion"
                  label="Dirección de entrega *"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Ej. Av. San Martín 1250, Piso 2"
                  disabled={crearPedidoMutation.isPending}
                  error={
                    field.state.meta.errors.length > 0
                      ? String(field.state.meta.errors[0])
                      : undefined
                  }
                />
              )}
            </form.Field>

            <form.Field name="forma_pago">
              {(field) => (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Forma de pago *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((opcion) => (
                      <label
                        key={opcion}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          field.state.value === opcion
                            ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="forma_pago"
                          value={opcion}
                          checked={field.state.value === opcion}
                          onChange={() => field.handleChange(opcion)}
                          className="text-blue-600"
                        />
                        <span className="text-sm font-semibold">
                          {opcion === 'EFECTIVO'
                            ? 'Efectivo al recibir'
                            : 'Transferencia bancaria'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div>
                  <label
                    htmlFor="checkout-notas"
                    className="block text-xs font-semibold text-slate-600 mb-1.5"
                  >
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="checkout-notas"
                    rows={3}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej. Sin cebolla, tocar timbre B..."
                    disabled={crearPedidoMutation.isPending}
                    className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
              )}
            </form.Field>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Link
                to="/carrito"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Volver al carrito
              </Link>
              <Button
                type="submit"
                loading={crearPedidoMutation.isPending}
              >
                Confirmar pedido
              </Button>
            </div>
          </form>
        </Card>

        <div>
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Tu pedido</h2>
            <ul className="divide-y divide-slate-100 text-sm">
              {items.map((item) => (
                <li
                  key={item.producto_id}
                  className="py-2.5 flex justify-between gap-2"
                >
                  <span className="text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {item.cantidad}x
                    </span>{' '}
                    {item.nombre}
                  </span>
                  <span className="font-semibold text-slate-900 shrink-0">
                    {formatCurrency(item.precio_unitario * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Total a pagar</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(total)}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
