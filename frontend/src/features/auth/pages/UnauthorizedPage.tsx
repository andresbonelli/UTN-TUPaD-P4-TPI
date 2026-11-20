import { Link } from 'react-router-dom'
import { Card } from '../../../shared/ui/Card'
import { useAuthStore } from '../../../store/authStore'

export function UnauthorizedPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const homePath = usuario?.role === 'admin' ? '/admin/resumen' : '/'

  return (
    <div className="max-w-lg mx-auto mt-12">
      <Card className="p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0-6V7m0 14a9 9 0 110-18 9 9 0 010 18z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Acceso no autorizado</h1>
        <p className="text-sm text-slate-600 mt-2">
          No tenés permisos suficientes para acceder a esta sección.
        </p>
        <div className="mt-6">
          <Link
            to={homePath}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </Card>
    </div>
  )
}
