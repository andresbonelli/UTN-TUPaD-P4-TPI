"""Repositorio de Categoria."""

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    """Consultas sobre la tabla categoria."""

    def __init__(self, session: Session):
        super().__init__(Categoria, session)

    def get_all_active(self) -> list[Categoria]:
        return list(
            self.session.exec(
                select(Categoria)
                .where(Categoria.activo == True)  # noqa: E712
                .order_by(Categoria.id)
            ).all()
        )

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(
            select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        ).first()

    def exists_nombre_excluding(self, nombre: str, exclude_id: int) -> bool:
        existing = self.session.exec(
            select(Categoria).where(
                func.lower(Categoria.nombre) == nombre.lower(),
                Categoria.id != exclude_id,
            )
        ).first()
        return existing is not None
