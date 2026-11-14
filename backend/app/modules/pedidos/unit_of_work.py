"""Unit of Work específico del módulo de pedidos."""

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Expone repositorios de pedidos y productos sobre la misma sesión transaccional."""

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
