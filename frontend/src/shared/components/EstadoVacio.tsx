import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: EstadoVacioProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-xs">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
      {descripcion && (
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          {descripcion}
        </p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
