import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'
import { UsuariosTable } from '../components/UsuariosTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'

export function AdminUsuariosPage() {
  const currentUser = useAuthStore((s) => s.usuario)
  const { data: usuarios = [], isLoading, isError, error, refetch } = useUsuarios()
  const activarMutation = useActivarUsuario()
  const desactivarMutation = useDesactivarUsuario()
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleActivar = async (usuario: Usuario) => {
    try {
      await activarMutation.mutateAsync(usuario.id)
      setFeedback({
        type: 'success',
        text: `Cuenta "@${usuario.username}" activada.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo activar la cuenta',
      })
    }
  }

  const handleDesactivar = async (usuario: Usuario) => {
    const confirmed = window.confirm(
      `¿Seguro que querés desactivar la cuenta "@${usuario.username}"?`,
    )
    if (!confirmed) return
    try {
      await desactivarMutation.mutateAsync(usuario.id)
      setFeedback({
        type: 'success',
        text: `Cuenta "@${usuario.username}" desactivada.`,
      })
    } catch (err) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error ? err.message : 'No se pudo desactivar la cuenta',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Administración de usuarios
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Visualizá las cuentas registradas y activá o desactivá su acceso.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {isLoading ? (
        <Skeleton variant="rows" count={5} />
      ) : isError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'Error al cargar los usuarios'
          }
          onRetry={() => void refetch()}
        />
      ) : usuarios.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios registrados" />
      ) : (
        <UsuariosTable
          usuarios={usuarios}
          currentUserId={currentUser?.id ?? -1}
          isMutating={activarMutation.isPending || desactivarMutation.isPending}
          onActivar={(u) => void handleActivar(u)}
          onDesactivar={(u) => void handleDesactivar(u)}
        />
      )}
    </div>
  )
}
