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
import type { Categoria } from '../types/categoria'
import { Button } from '../../../shared/ui/Button'

interface CategoriaTableProps {
  categorias: Categoria[]
  onEdit: (categoria: Categoria) => void
  onDelete: (categoria: Categoria) => void
}

export function CategoriaTable({
  categorias,
  onEdit,
  onDelete,
}: CategoriaTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Categoria>[]>(
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
        header: 'Nombre',
        cell: (info) => (
          <span className="font-semibold text-slate-900">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: (info) => (
          <span className="text-slate-600">
            {String(info.getValue() || '—')}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
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
              Dar de baja
            </Button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: categorias,
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
          placeholder="Buscar categorías..."
          className="w-full sm:max-w-xs px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <span className="text-xs text-slate-500">
          {table.getFilteredRowModel().rows.length} categorías activas
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
