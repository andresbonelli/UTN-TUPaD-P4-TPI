import { Link } from 'react-router-dom'
import { useResumenPedidos } from '../hooks/usePedidos'
import { ResumenCards } from '../components/ResumenCards'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Card } from '../../../shared/ui/Card'

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  const accesos = [
    {
      to: '/admin/pedidos',
      titulo: 'Gestionar pedidos',
      desc: 'Avanzar estados y revisar detalles de compra',
    },
    {
      to: '/admin/productos',
      titulo: 'Productos y stock',
      desc: 'Editar precios, disponibilidad y existencias',
    },
    {
      to: '/admin/categorias',
      titulo: 'Categorías',
      desc: 'Administrar categorías del catálogo',
    },
    {
      to: '/admin/usuarios',
      titulo: 'Usuarios',
      desc: 'Activar o desactivar cuentas de acceso',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Resumen del negocio
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Indicadores en tiempo real de pedidos e ingresos entregados.
        </p>
      </div>

      {isLoading ? (
        <Skeleton count={6} variant="cards" />
      ) : isError || !data ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el resumen'
          }
          onRetry={() => void refetch()}
        />
      ) : (
        <ResumenCards resumen={data} />
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Accesos rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accesos.map((item) => (
            <Link key={item.to} to={item.to} className="block">
              <Card className="p-5 h-full hover:border-blue-300 hover:shadow-md transition-all">
                <h3 className="font-bold text-slate-900">{item.titulo}</h3>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
