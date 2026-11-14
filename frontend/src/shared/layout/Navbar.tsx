import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  }`
}

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const items = useCartStore((s) => s.items)

  const totalCantidad = items.reduce((acc, item) => acc + item.cantidad, 0)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          {/* Logo y links principales */}
          <div className="flex items-center gap-6 flex-wrap">
            <Link
              to="/"
              className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900"
            >
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                FS
              </span>
              <span>Food Store</span>
            </Link>

            <nav className="flex items-center gap-1 flex-wrap">
              <NavLink to="/" end className={navLinkClass}>
                Catálogo
              </NavLink>
              <NavLink to="/carrito" className={navLinkClass}>
                <span className="inline-flex items-center gap-1.5">
                  Carrito
                  {totalCantidad > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-blue-600 text-white">
                      {totalCantidad}
                    </span>
                  )}
                </span>
              </NavLink>
              {usuario && (
                <NavLink to="/mis-pedidos" className={navLinkClass}>
                  Mis pedidos
                </NavLink>
              )}
              {usuario?.role === 'admin' && (
                <>
                  <span className="h-4 w-px bg-slate-200 mx-1 hidden sm:inline-block" />
                  <NavLink to="/admin/resumen" className={navLinkClass}>
                    Resumen
                  </NavLink>
                  <NavLink to="/admin/categorias" className={navLinkClass}>
                    Categorías
                  </NavLink>
                  <NavLink to="/admin/productos" className={navLinkClass}>
                    Productos
                  </NavLink>
                  <NavLink to="/admin/pedidos" className={navLinkClass}>
                    Pedidos
                  </NavLink>
                  <NavLink to="/admin/usuarios" className={navLinkClass}>
                    Usuarios
                  </NavLink>
                </>
              )}
            </nav>
          </div>

          {/* Sesión */}
          <div className="flex items-center gap-3">
            {usuario ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {usuario.full_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    @{usuario.username} ·{' '}
                    <span className="uppercase font-semibold text-blue-600">
                      {usuario.role}
                    </span>
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
