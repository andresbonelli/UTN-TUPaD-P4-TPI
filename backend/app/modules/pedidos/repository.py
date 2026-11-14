"""Repositorio de Pedido."""

from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """Consultas sobre la tabla pedido y sus líneas."""

    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def get_with_items(self, pedido_id: int) -> Pedido | None:
        return self.session.exec(
            select(Pedido)
            .where(Pedido.id == pedido_id)
            .options(selectinload(Pedido.items))
        ).first()

    def list_by_usuario(
        self,
        usuario_id: int | None = None,
        *,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        """Lista pedidos paginados (de un usuario específico o de todos si usuario_id es None)."""
        filters = []
        if usuario_id is not None:
            filters.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filters.append(Pedido.estado == estado)

        total_stmt = select(func.count(Pedido.id)).where(*filters)
        total = int(self.session.exec(total_stmt).one())

        items_stmt = (
            select(Pedido)
            .where(*filters)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(self.session.exec(items_stmt).all())
        return total, items

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(
            select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)
        ).all()
        return {estado: int(cantidad) for estado, cantidad in rows}

    def count_hoy(self) -> int:
        inicio_hoy = (
            datetime.now(timezone.utc)
            .replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
        )
        total = self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.created_at >= inicio_hoy)
        ).one()
        return int(total)

    def sum_ingresos_entregados(self) -> float:
        total = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
                Pedido.estado == "ENTREGADO"
            )
        ).one()
        return float(total)
