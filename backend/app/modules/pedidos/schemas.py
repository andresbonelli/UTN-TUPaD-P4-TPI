"""Schemas de entrada y salida para pedidos."""

from datetime import datetime
from typing import Literal

from pydantic import field_validator
from sqlmodel import Field, SQLModel

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]


class ItemPedidoCreate(SQLModel):
    """Ítem del carrito enviado al crear un pedido."""

    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Datos para confirmar un pedido desde el carrito."""

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str = Field(default="")

    @field_validator("direccion_entrega")
    @classmethod
    def validate_direccion(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5 or len(cleaned) > 200:
            raise ValueError("La dirección de entrega debe tener entre 5 y 200 caracteres")
        return cleaned

    @field_validator("notas")
    @classmethod
    def strip_notas(cls, value: str) -> str:
        return value.strip()


class DetallePedidoRead(SQLModel):
    """Vista de lectura de una línea de pedido."""

    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    """Vista de lectura de un pedido completo con sus líneas."""

    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    """Respuesta paginada de pedidos."""

    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    """Payload para cambiar el estado de un pedido (admin)."""

    estado: EstadoPedido


class ResumenPedidos(SQLModel):
    """Indicadores agregados para el panel de administración."""

    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
