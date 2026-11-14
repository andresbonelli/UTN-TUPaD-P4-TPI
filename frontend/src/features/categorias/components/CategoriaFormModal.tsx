import { useForm } from '@tanstack/react-form'
import type { Categoria, CategoriaPayload } from '../types/categoria'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'

interface CategoriaFormModalProps {
  isOpen: boolean
  categoria: Categoria | null
  loading: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (payload: CategoriaPayload) => Promise<void>
}

export function CategoriaFormModal({
  isOpen,
  categoria,
  loading,
  errorMessage,
  onClose,
  onSubmit,
}: CategoriaFormModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      })
    },
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoria ? 'Editar categoría' : 'Nueva categoría'}
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
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const cleaned = value.trim()
              if (cleaned.length < 2 || cleaned.length > 100) {
                return 'El nombre debe tener entre 2 y 100 caracteres'
              }
              return undefined
            },
          }}
        >
          {(field) => (
            <Input
              id="cat-nombre"
              label="Nombre *"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej. Pizzas"
              disabled={loading}
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label
                htmlFor="cat-descripcion"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                Descripción
              </label>
              <textarea
                id="cat-descripcion"
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Descripción breve de la categoría"
                disabled={loading}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  )
}
