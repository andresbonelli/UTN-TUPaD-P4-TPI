import { useEffect, useState } from 'react'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido, Pedido } from '../types/pedido'
import { PedidoDetalleModal } from '../components/PedidoDetalleModal'
import { PedidosAdminTable } from '../components/PedidosAdminTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'

const PAGE_LIMIT = 15

export function AdminPedidosPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const [page, setPage] = useState(0)
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | undefined>(
    undefined,
  )
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const { data, isLoading, isError, error, refetch, isFetching } = usePedidos({
    skip: page * PAGE_LIMIT,
    limit: PAGE_LIMIT,
    estado: estadoFiltro,
  })
  const cambiarEstadoMutation = useCambiarEstadoPedido()

  useEffect(() => {
    if (usuario) {
      void refetch()
    }
  }, [usuario, refetch])

  const handleCambiarEstado = async (
    pedido: Pedido,
    siguiente: EstadoPedido,
  ) => {
    if (siguiente === 'CANCELADO') {
      const confirmed = window.confirm(
        `¿Seguro que querés cancelar el pedido #${pedido.id}? Se restituirá el stock de los productos.`,
      )
      if (!confirmed) return
    }
    try {
      await cambiarEstadoMutation.mutateAsync({
        id: pedido.id,
        estado: siguiente,
      })
      setFeedback({
        type: 'success',
        text: `Pedido #${pedido.id} actualizado a ${siguiente}.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar el estado del pedido',
      })
    }
  }

  const pedidos = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de pedidos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Avanzá pedidos en preparación, entregalos o cancelalos según la máquina de estados.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            loading={isFetching}
            title="Refrescar lista de pedidos"
          >
            ↻ Refrescar
          </Button>

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
        <Skeleton variant="rows" count={6} />
      ) : isError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'Error al cargar los pedidos'
          }
          onRetry={() => void refetch()}
        />
      ) : pedidos.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion="Probá cambiando el filtro de estado."
        />
      ) : (
        <>
          <PedidosAdminTable
            pedidos={pedidos}
            isMutating={cambiarEstadoMutation.isPending}
            onVerDetalle={setSelectedPedido}
            onCambiarEstado={(p, next) => void handleCambiarEstado(p, next)}
          />
          <Paginacion
            page={page}
            limit={PAGE_LIMIT}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      <PedidoDetalleModal
        pedido={selectedPedido}
        onClose={() => setSelectedPedido(null)}
      />
    </div>
  )
}
