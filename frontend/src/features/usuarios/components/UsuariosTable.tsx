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
import type { Usuario } from '../types/usuario'
import { Button } from '../../../shared/ui/Button'

interface UsuariosTableProps {
  usuarios: Usuario[]
  currentUserId: number
  isMutating: boolean
  onActivar: (usuario: Usuario) => void
  onDesactivar: (usuario: Usuario) => void
}

export function UsuariosTable({
  usuarios,
  currentUserId,
  isMutating,
  onActivar,
  onDesactivar,
}: UsuariosTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Usuario',
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            @{row.original.username}
          </span>
        ),
      },
      {
        accessorKey: 'full_name',
        header: 'Nombre',
        cell: (info) => (
          <span className="text-slate-700">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: (info) => (
          <span className="text-slate-600">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              row.original.role === 'admin'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              row.original.disabled
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {row.original.disabled ? 'Desactivado' : 'Activo'}
          </span>
        ),
      },
      {
        id: 'acciones',
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => {
          const user = row.original
          const esSesionActual = user.id === currentUserId
          return (
            <div className="flex justify-end gap-2">
              {user.disabled ? (
                <Button
                  variant="success"
                  size="sm"
                  disabled={isMutating}
                  onClick={() => onActivar(user)}
                >
                  Activar
                </Button>
              ) : esSesionActual ? (
                <span className="text-xs text-slate-400 italic py-1.5">
                  Sesión actual
                </span>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  disabled={isMutating}
                  onClick={() => onDesactivar(user)}
                >
                  Desactivar
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [currentUserId, isMutating, onActivar, onDesactivar],
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: usuarios,
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
          placeholder="Buscar por usuario, nombre o email..."
          className="w-full sm:max-w-xs px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <span className="text-xs text-slate-500">
          {table.getFilteredRowModel().rows.length} usuarios
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
