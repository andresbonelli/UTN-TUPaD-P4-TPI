import type { ResumenPedidos } from '../types/pedido'
import { formatCurrency } from '../../../shared/utils/format'
import { Card } from '../../../shared/ui/Card'

interface ResumenCardsProps {
  resumen: ResumenPedidos
}

export function ResumenCards({ resumen }: ResumenCardsProps) {
  const cards = [
    {
      label: 'Pendientes',
      value: String(resumen.pendientes),
      accent: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'En preparación',
      value: String(resumen.en_preparacion),
      accent: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      label: 'Entregados',
      value: String(resumen.entregados),
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Cancelados',
      value: String(resumen.cancelados),
      accent: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      label: 'Pedidos hoy',
      value: String(resumen.pedidos_hoy),
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      label: 'Ingresos entregados',
      value: formatCurrency(resumen.ingresos_entregados),
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((item) => (
        <Card key={item.label} className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {item.label}
          </p>
          <p
            className={`mt-3 inline-block px-3 py-1 rounded-xl text-2xl font-extrabold border ${item.accent}`}
          >
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  )
}
