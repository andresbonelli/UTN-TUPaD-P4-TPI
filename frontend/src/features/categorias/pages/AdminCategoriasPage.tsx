import { useState } from 'react'
import {
  useCategorias,
  useCreateCategoria,
  useDeleteCategoria,
  useUpdateCategoria,
} from '../hooks/useCategorias'
import type { Categoria, CategoriaPayload } from '../types/categoria'
import { CategoriaFormModal } from '../components/CategoriaFormModal'
import { CategoriaTable } from '../components/CategoriaTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'

export function AdminCategoriasPage() {
  const { data: categorias = [], isLoading, isError, error, refetch } = useCategorias()
  const createMutation = useCreateCategoria()
  const updateMutation = useUpdateCategoria()
  const deleteMutation = useDeleteCategoria()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [pageFeedback, setPageFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalError(null)
    setModalOpen(true)
  }

  const openEdit = (cat: Categoria) => {
    setEditing(cat)
    setModalError(null)
    setModalOpen(true)
  }

  const handleClose = () => {
    if (createMutation.isPending || updateMutation.isPending) return
    setModalOpen(false)
    setEditing(null)
    setModalError(null)
  }

  const handleSubmit = async (payload: CategoriaPayload) => {
    setModalError(null)
    try {
      if (editing) {
        const updated = await updateMutation.mutateAsync({
          id: editing.id,
          data: payload,
        })
        setPageFeedback({
          type: 'success',
          text: `Categoría "${updated.nombre}" actualizada correctamente.`,
        })
      } else {
        const created = await createMutation.mutateAsync(payload)
        setPageFeedback({
          type: 'success',
          text: `Categoría "${created.nombre}" creada correctamente.`,
        })
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'Error al guardar la categoría',
      )
    }
  }

  const handleDelete = async (cat: Categoria) => {
    const confirmed = window.confirm(
      `¿Seguro que querés dar de baja la categoría "${cat.nombre}"?`,
    )
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(cat.id)
      setPageFeedback({
        type: 'success',
        text: `Categoría "${cat.nombre}" dada de baja.`,
      })
    } catch (err) {
      setPageFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo dar de baja',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Administración de categorías
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Creá, editá y gestioná las categorías activas del catálogo.
          </p>
        </div>
        <Button onClick={openCreate}>+ Nueva categoría</Button>
      </div>

      {pageFeedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border ${
            pageFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {pageFeedback.text}
        </div>
      )}

      {isLoading ? (
        <Skeleton variant="rows" count={5} />
      ) : isError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'Error al cargar las categorías'
          }
          onRetry={() => void refetch()}
        />
      ) : categorias.length === 0 ? (
        <EstadoVacio
          titulo="No hay categorías activas"
          descripcion="Creá la primera categoría para comenzar a organizar tus productos."
          accion={<Button onClick={openCreate}>Crear categoría</Button>}
        />
      ) : (
        <CategoriaTable
          categorias={categorias}
          onEdit={openEdit}
          onDelete={(cat) => void handleDelete(cat)}
        />
      )}

      {modalOpen && (
        <CategoriaFormModal
          key={editing ? `edit-${editing.id}` : 'create'}
          isOpen={modalOpen}
          categoria={editing}
          loading={createMutation.isPending || updateMutation.isPending}
          errorMessage={modalError}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}
