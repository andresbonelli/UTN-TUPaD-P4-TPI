import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types/pedido'
import { PedidoDetalleModal } from '../components/PedidoDetalleModal'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'

const PAGE_LIMIT = 10

export function MisPedidosPage() {
  const [page, setPage] = useState(0)
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | undefined>(
    undefined,
  )
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: page * PAGE_LIMIT,
    limit: PAGE_LIMIT,
    estado: estadoFiltro,
  })
  const cancelarMutation = useCancelarPedido()

  const handleCancelar = async (pedido: Pedido) => {
    const confirmed = window.confirm(
      `¿Seguro que querés cancelar el pedido #${pedido.id}?`,
    )
    if (!confirmed) return
    try {
      await cancelarMutation.mutateAsync(pedido.id)
      setFeedback({
        type: 'success',
        text: `El pedido #${pedido.id} fue cancelado y su stock fue restituido.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No se pudo cancelar el pedido',
      })
    }
  }

  const pedidos = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis pedidos</h1>
          <p className="text-sm text-slate-500 mt-1">
            Seguí el estado de tus pedidos y consultá el detalle de cada compra.
          </p>
        </div>

        <select
          value={estadoFiltro ?? ''}
          onChange={(e) => {
            const val = e.target.value
            setEstadoFiltro(val ? (val as EstadoPedido) : undefined)
            setPage(0)
          }}
          className="px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {isLoading ? (
        <Skeleton variant="rows" count={5} />
      ) : isError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'Error al cargar tus pedidos'
          }
          onRetry={() => void refetch()}
        />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no tenés pedidos"
          descripcion="Cuando confirmes un pedido desde el carrito aparecerá acá."
          accion={
            <Link
              to="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Ir al catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Card
              key={pedido.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-900">
                    Pedido #{pedido.id}
                  </span>
                  <BadgeEstado estado={pedido.estado} />
                  <span className="text-xs text-slate-500">
                    {formatDateTime(pedido.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Entrega: <span className="font-medium">{pedido.direccion_entrega}</span> ·{' '}
                  Pago: <span className="font-medium">{pedido.forma_pago}</span>
                </p>
                <p className="text-xs text-slate-500">
                  {pedido.items.length}{' '}
                  {pedido.items.length === 1 ? 'ítem' : 'ítems'}
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <span className="text-lg font-extrabold text-slate-900">
                  {formatCurrency(pedido.total)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedPedido(pedido)}
                  >
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelarMutation.isPending}
                      onClick={() => void handleCancelar(pedido)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Paginacion
            page={page}
            limit={PAGE_LIMIT}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      <PedidoDetalleModal
        pedido={selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </div>
  )
}
