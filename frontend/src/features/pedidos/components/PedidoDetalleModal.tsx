import type { Pedido } from '../types/pedido'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'

interface PedidoDetalleModalProps {
  pedido: Pedido | null
  onClose: () => void
}

export function PedidoDetalleModal({
  pedido,
  onClose,
}: PedidoDetalleModalProps) {
  if (!pedido) return null

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Detalle del pedido #${pedido.id}`}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Estado
            </p>
            <div className="mt-1">
              <BadgeEstado estado={pedido.estado} />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Fecha de creación
            </p>
            <p className="font-medium text-slate-800 mt-1">
              {formatDateTime(pedido.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Dirección de entrega
            </p>
            <p className="font-medium text-slate-800 mt-1">
              {pedido.direccion_entrega}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">
              Forma de pago
            </p>
            <p className="font-medium text-slate-800 mt-1">
              {pedido.forma_pago}
            </p>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500 uppercase font-semibold">
                Notas
              </p>
              <p className="text-slate-700 mt-1">{pedido.notas}</p>
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Producto</th>
                <th className="px-4 py-2.5 text-right">Precio unit.</th>
                <th className="px-4 py-2.5 text-right">Cant.</th>
                <th className="px-4 py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedido.items.map((item) => (
                <tr key={item.producto_id}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {item.nombre_producto}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {formatCurrency(item.precio_unitario)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-700">
                    {item.cantidad}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right font-bold text-slate-700"
                >
                  Total
                </td>
                <td className="px-4 py-3 text-right text-base font-extrabold text-slate-900">
                  {formatCurrency(pedido.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  )
}
