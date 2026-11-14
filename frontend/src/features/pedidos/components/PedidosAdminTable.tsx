import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { EstadoPedido, Pedido } from '../types/pedido'
import { formatCurrency, formatDateTime } from '../../../shared/utils/format'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'

interface PedidosAdminTableProps {
  pedidos: Pedido[]
  isMutating: boolean
  onVerDetalle: (pedido: Pedido) => void
  onCambiarEstado: (pedido: Pedido, siguiente: EstadoPedido) => void
}

export function PedidosAdminTable({
  pedidos,
  isMutating,
  onVerDetalle,
  onCambiarEstado,
}: PedidosAdminTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Pedido',
        cell: (info) => (
          <span className="font-bold text-slate-900">
            #{String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'usuario_id',
        header: 'Cliente ID',
        cell: (info) => (
          <span className="text-slate-600">Usuario #{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: (info) => (
          <span className="text-slate-600">
            {formatDateTime(String(info.getValue()))}
          </span>
        ),
      },
      {
        accessorKey: 'forma_pago',
        header: 'Pago',
        cell: (info) => (
          <span className="text-xs font-semibold text-slate-700">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: (info) => (
          <span className="font-bold text-slate-900">
            {formatCurrency(Number(info.getValue()))}
          </span>
        ),
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={String(info.getValue())} />,
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
          const pedido = row.original
          return (
            <div className="flex justify-end gap-2 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onVerDetalle(pedido)}
              >
                Detalle
              </Button>
              {pedido.estado === 'PENDIENTE' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => onCambiarEstado(pedido, 'EN_PREPARACION')}
                  >
                    Preparar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => onCambiarEstado(pedido, 'CANCELADO')}
                  >
                    Cancelar
                  </Button>
                </>
              )}
              {pedido.estado === 'EN_PREPARACION' && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => onCambiarEstado(pedido, 'ENTREGADO')}
                  >
                    Entregar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isMutating}
                    onClick={() => onCambiarEstado(pedido, 'CANCELADO')}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [isMutating, onCambiarEstado, onVerDetalle],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: pedidos,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-5 py-3.5 ${
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none hover:text-slate-800'
                        : ''
                    }`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
