import { useForm } from '@tanstack/react-form'
import type { Producto, ProductoStockPayload } from '../types/producto'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'

interface StockModalProps {
  isOpen: boolean
  producto: Producto | null
  loading: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (payload: ProductoStockPayload) => Promise<void>
}

export function StockModal({
  isOpen,
  producto,
  loading,
  errorMessage,
  onClose,
  onSubmit,
}: StockModalProps) {
  const form = useForm({
    defaultValues: {
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        stock: Number(value.stock),
        disponible: value.disponible,
      })
    },
  })

  if (!producto) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock y disponibilidad — ${producto.nombre}`}
      maxWidthClass="max-w-md"
    >
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value)
              if (
                value === '' ||
                Number.isNaN(n) ||
                !Number.isInteger(n) ||
                n < 0
              ) {
                return 'El stock debe ser un entero >= 0'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="stock-cantidad"
              label="Stock actual *"
              type="number"
              min="0"
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={loading}
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Producto disponible en el catálogo</span>
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Actualizar stock
          </Button>
        </div>
      </form>
    </Modal>
  )
}
