"""Unit of Work específico del módulo de categorías."""

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    """Expone el repositorio de categorías sobre la sesión transaccional."""

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.categorias = CategoriaRepository(self.session)
        return self
