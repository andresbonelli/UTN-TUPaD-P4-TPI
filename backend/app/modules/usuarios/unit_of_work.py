"""Unit of Work específico del módulo de usuarios."""

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """Expone el repositorio de usuarios sobre la sesión transaccional."""

    def __enter__(self):
        super().__enter__()
        assert self.session is not None
        self.usuarios = UsuarioRepository(self.session)
        return self
