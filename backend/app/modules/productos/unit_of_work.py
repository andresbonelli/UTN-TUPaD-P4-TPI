"""Unit of Work específico del módulo de productos."""

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Expone repositorios de productos y categorías sobre la misma sesión."""

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
