import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { UserRole } from '../features/auth/types/auth'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verificando sesión...</span>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    )
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
