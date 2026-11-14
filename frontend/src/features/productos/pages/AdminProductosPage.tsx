import { useState } from 'react'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import {
  useCreateProducto,
  useDeleteProducto,
  useProductos,
  useUpdateProducto,
  useUpdateProductoStock,
} from '../hooks/useProductos'
import type {
  Producto,
  ProductoPayload,
  ProductoStockPayload,
} from '../types/producto'
import { ProductoFormModal } from '../components/ProductoFormModal'
import { ProductoTable } from '../components/ProductoTable'
import { StockModal } from '../components/StockModal'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'

export function AdminProductosPage() {
  const { data: categorias = [] } = useCategorias()
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: 0,
    limit: 100,
  })
  const createMutation = useCreateProducto()
  const updateMutation = useUpdateProducto()
  const stockMutation = useUpdateProductoStock()
  const deleteMutation = useDeleteProducto()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [stockTarget, setStockTarget] = useState<Producto | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [pageFeedback, setPageFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalError(null)
    setFormOpen(true)
  }

  const openEdit = (prod: Producto) => {
    setEditing(prod)
    setModalError(null)
    setFormOpen(true)
  }

  const openStock = (prod: Producto) => {
    setStockTarget(prod)
    setModalError(null)
  }

  const handleSaveProducto = async (payload: ProductoPayload) => {
    setModalError(null)
    try {
      if (editing) {
        const updated = await updateMutation.mutateAsync({
          id: editing.id,
          data: payload,
        })
        setPageFeedback({
          type: 'success',
          text: `Producto "${updated.nombre}" actualizado.`,
        })
      } else {
        const created = await createMutation.mutateAsync(payload)
        setPageFeedback({
          type: 'success',
          text: `Producto "${created.nombre}" creado.`,
        })
      }
      setFormOpen(false)
      setEditing(null)
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'Error al guardar el producto',
      )
    }
  }

  const handleSaveStock = async (payload: ProductoStockPayload) => {
    if (!stockTarget) return
    setModalError(null)
    try {
      const updated = await stockMutation.mutateAsync({
        id: stockTarget.id,
        data: payload,
      })
      setPageFeedback({
        type: 'success',
        text: `Stock de "${updated.nombre}" actualizado a ${updated.stock}.`,
      })
      setStockTarget(null)
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : 'Error al actualizar el stock',
      )
    }
  }

  const handleDelete = async (prod: Producto) => {
    const confirmed = window.confirm(
      `¿Seguro que querés dar de baja el producto "${prod.nombre}"?`,
    )
    if (!confirmed) return
    try {
      await deleteMutation.mutateAsync(prod.id)
      setPageFeedback({
        type: 'success',
        text: `Producto "${prod.nombre}" dado de baja.`,
      })
    } catch (err) {
      setPageFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo dar de baja',
      })
    }
  }

  const productos = data?.items ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Administración de productos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestioná el catálogo, precios, stock y disponibilidad.
          </p>
        </div>
        <Button onClick={openCreate}>+ Nuevo producto</Button>
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
        <Skeleton variant="rows" count={6} />
      ) : isError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'Error al cargar los productos'
          }
          onRetry={() => void refetch()}
        />
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No hay productos activos"
          descripcion="Agregá tu primer producto para mostrarlo en el catálogo."
          accion={<Button onClick={openCreate}>Crear producto</Button>}
        />
      ) : (
        <ProductoTable
          productos={productos}
          onEdit={openEdit}
          onEditStock={openStock}
          onDelete={(prod) => void handleDelete(prod)}
        />
      )}

      {formOpen && (
        <ProductoFormModal
          key={editing ? `edit-${editing.id}` : 'create'}
          isOpen={formOpen}
          producto={editing}
          categorias={categorias}
          loading={createMutation.isPending || updateMutation.isPending}
          errorMessage={modalError}
          onClose={() => {
            if (!createMutation.isPending && !updateMutation.isPending) {
              setFormOpen(false)
              setEditing(null)
            }
          }}
          onSubmit={handleSaveProducto}
        />
      )}

      {stockTarget && (
        <StockModal
          key={`stock-${stockTarget.id}`}
          isOpen={true}
          producto={stockTarget}
          loading={stockMutation.isPending}
          errorMessage={modalError}
          onClose={() => {
            if (!stockMutation.isPending) {
              setStockTarget(null)
            }
          }}
          onSubmit={handleSaveStock}
        />
      )}
    </div>
  )
}
