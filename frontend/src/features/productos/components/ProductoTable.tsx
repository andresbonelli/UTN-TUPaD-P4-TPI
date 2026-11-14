import { useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import type { Producto } from '../types/producto'
import { formatCurrency } from '../../../shared/utils/format'
import { Button } from '../../../shared/ui/Button'

interface ProductoTableProps {
  productos: Producto[]
  onEdit: (producto: Producto) => void
  onEditStock: (producto: Producto) => void
  onDelete: (producto: Producto) => void
}

export function ProductoTable({
  productos,
  onEdit,
  onEditStock,
  onDelete,
}: ProductoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (info) => (
          <span className="text-slate-500 font-medium">
            #{String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'nombre',
        header: 'Producto',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-900">{row.original.nombre}</p>
            <p className="text-xs text-slate-500">
              {row.original.categoria?.nombre}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: (info) => (
          <span className="font-semibold text-slate-800">
            {formatCurrency(Number(info.getValue()))}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span
            className={`font-semibold ${
              row.original.stock > 0 ? 'text-slate-800' : 'text-red-600'
            }`}
          >
            {row.original.stock}
          </span>
        ),
      },
      {
        accessorKey: 'disponible',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              row.original.disponible
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {row.original.disponible ? 'Disponible' : 'Pausado'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEditStock(row.original)}
            >
              Stock
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(row.original)}
            >
              Baja
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onEditStock, onDelete],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: productos,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <input
          type="text"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filtrar productos..."
          className="w-full sm:max-w-xs px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <span className="text-xs text-slate-500">
          {table.getFilteredRowModel().rows.length} productos activos
        </span>
      </div>

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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-sm">
            <span className="text-slate-600">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
