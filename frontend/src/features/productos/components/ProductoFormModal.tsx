import { useForm } from '@tanstack/react-form'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoPayload } from '../types/producto'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Modal } from '../../../shared/ui/Modal'

interface ProductoFormModalProps {
  isOpen: boolean
  producto: Producto | null
  categorias: Categoria[]
  loading: boolean
  errorMessage: string | null
  onClose: () => void
  onSubmit: (payload: ProductoPayload) => Promise<void>
}

export function ProductoFormModal({
  isOpen,
  producto,
  categorias,
  loading,
  errorMessage,
  onClose,
  onSubmit,
}: ProductoFormModalProps) {
  const defaultCategoriaId =
    producto?.categoria_id ?? (categorias[0]?.id ? categorias[0].id : 0)

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: String(defaultCategoriaId),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim(),
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      })
    },
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={producto ? 'Editar producto' : 'Nuevo producto'}
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
            onChange: ({ value }) =>
              !value.trim() ? 'El nombre es obligatorio' : undefined,
          }}
        >
          {(field) => (
            <Input
              id="prod-nombre"
              label="Nombre *"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Ej. Burger Doble"
              disabled={loading}
              error={
                field.state.meta.errors.length > 0
                  ? String(field.state.meta.errors[0])
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              !Number(value) ? 'Seleccioná una categoría' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label
                htmlFor="prod-categoria"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                Categoría *
              </label>
              <select
                id="prod-categoria"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="0" disabled>
                  Seleccioná una categoría
                </option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-red-500 text-xs mt-1">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                const n = Number(value)
                if (value === '' || Number.isNaN(n) || n < 0) {
                  return 'Debe ser un número >= 0'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="prod-precio"
                label="Precio *"
                type="number"
                step="0.01"
                min="0"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

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
                  return 'Debe ser un entero >= 0'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <Input
                id="prod-stock"
                label="Stock *"
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
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              id="prod-imagen"
              label="URL de imagen"
              type="url"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://..."
              disabled={loading}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label
                htmlFor="prod-descripcion"
                className="block text-xs font-semibold text-slate-600 mb-1.5"
              >
                Descripción
              </label>
              <textarea
                id="prod-descripcion"
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Ingredientes o detalles del producto"
                disabled={loading}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
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
              <span>Disponible para la venta</span>
            </label>
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
