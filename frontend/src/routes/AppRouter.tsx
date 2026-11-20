import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage'
import { useAuthStore } from '../store/authStore'

export function AppRouter() {
  const usuario = useAuthStore((s) => s.usuario)
  const isAdmin = usuario?.role === 'admin'

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas públicas / cliente */}
          <Route
            path="/"
            element={
              isAdmin ? (
                <Navigate to="/admin/resumen" replace />
              ) : (
                <CatalogoPage />
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/carrito"
            element={
              isAdmin ? (
                <Navigate to="/admin/resumen" replace />
              ) : (
                <CarritoPage />
              )
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas exclusivas para clientes con sesión iniciada */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Rutas de administración */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route
            path="*"
            element={<Navigate to={isAdmin ? '/admin/resumen' : '/'} replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
