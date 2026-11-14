export type EstadoPedidoValue =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'ENTREGADO'
  | 'CANCELADO'

interface BadgeEstadoProps {
  estado: string
}

const estadoConfig: Record<string, { label: string; classes: string }> = {
  PENDIENTE: {
    label: 'Pendiente',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  EN_PREPARACION: {
    label: 'En preparación',
    classes: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ENTREGADO: {
    label: 'Entregado',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELADO: {
    label: 'Cancelado',
    classes: 'bg-red-50 text-red-700 border-red-200',
  },
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const cfg = estadoConfig[estado] ?? {
    label: estado,
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  )
}
