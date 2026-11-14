import { Button } from '../ui/Button'

interface PaginacionProps {
  page: number
  limit: number
  total: number
  onPageChange: (nextPage: number) => void
}

export function Paginacion({
  page,
  limit,
  total,
  onPageChange,
}: PaginacionProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (total === 0) return null

  const start = page * limit + 1
  const end = Math.min((page + 1) * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200/80">
      <p className="text-sm text-slate-600">
        Mostrando <span className="font-semibold text-slate-900">{start}</span>–
        <span className="font-semibold text-slate-900">{end}</span> de{' '}
        <span className="font-semibold text-slate-900">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className="text-sm text-slate-600 px-2">
          Página {page + 1} de {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
