import { useState } from 'react'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'

const PAGE_LIMIT = 9

export function CatalogoPage() {
  const [page, setPage] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const { data: categorias = [] } = useCategorias()
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductos({
    skip: page * PAGE_LIMIT,
    limit: PAGE_LIMIT,
    search: searchQuery || undefined,
    categoria_id: categoriaId,
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    setSearchQuery(searchInput.trim())
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setCategoriaId(undefined)
    setPage(0)
  }

  const handleCategoryChange = (nextId: number | undefined) => {
    setCategoriaId(nextId)
    setPage(0)
  }

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Nuestro menú
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Elegí tus platos favoritos y armá tu pedido al instante.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"
        >
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              if (e.target.value === '') {
                setSearchQuery('')
                setPage(0)
              }
            }}
            placeholder="Buscar plato..."
            className="w-full sm:w-64 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <Button type="submit" size="md">
            Buscar
          </Button>
        </form>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange(undefined)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            categoriaId === undefined
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Todas
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              categoriaId === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <Skeleton count={6} variant="cards" />
      ) : isError ? (
        <EstadoError
          mensaje={
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el catálogo.'
          }
          onRetry={() => void refetch()}
        />
      ) : items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion="Probá cambiando los filtros de búsqueda o seleccionando otra categoría."
          accion={
            (searchQuery || categoriaId !== undefined) && (
              <Button variant="secondary" onClick={handleClearFilters}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion
            page={page}
            limit={PAGE_LIMIT}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
