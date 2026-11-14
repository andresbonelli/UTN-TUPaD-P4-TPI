import { Button } from '../ui/Button'

interface EstadoErrorProps {
  mensaje?: string
  onRetry?: () => void
}

export function EstadoError({
  mensaje = 'Ocurrió un error al cargar los datos.',
  onRetry,
}: EstadoErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-sm font-medium text-red-700">{mensaje}</p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  )
}
