"""Repositorio de Producto."""

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    """Consultas sobre la tabla producto."""

    def __init__(self, session: Session):
        super().__init__(Producto, session)

    def get_active_with_categoria(self, producto_id: int) -> Producto | None:
        return self.session.exec(
            select(Producto)
            .where(Producto.id == producto_id, Producto.activo == True)  # noqa: E712
            .options(selectinload(Producto.categoria))
        ).first()

    def search(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        filters = [Producto.activo == True]  # noqa: E712

        if search and search.strip():
            filters.append(Producto.nombre.ilike(f"%{search.strip()}%"))

        if categoria_id is not None:
            filters.append(Producto.categoria_id == categoria_id)

        if disponible is not None:
            filters.append(Producto.disponible == disponible)

        total_stmt = select(func.count(Producto.id)).where(*filters)
        total = int(self.session.exec(total_stmt).one())

        items_stmt = (
            select(Producto)
            .where(*filters)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items
