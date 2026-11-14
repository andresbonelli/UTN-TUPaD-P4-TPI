"""Service de Pedidos — reglas de negocio RN-01 a RN-06 y máquina de estados."""

from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


class PedidoNoEncontrado(Exception):
    """Pedido inexistente."""


class ProductoNoEncontrado(Exception):
    """Producto inexistente o dado de baja."""


class PedidoAjeno(Exception):
    """El usuario intenta acceder o cancelar un pedido que no le pertenece."""


class StockInsuficiente(Exception):
    """Stock insuficiente para la cantidad solicitada."""


class ProductoNoDisponible(Exception):
    """Producto marcado como no disponible para la venta."""


class ProductoRepetido(Exception):
    """Producto repetido en los ítems de un mismo pedido."""


class TransicionInvalida(Exception):
    """Transición de estado no permitida por la máquina de estados."""


TRANSICIONES_VALIDAS: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    """Orquesta creación transaccional, consulta, avance de estado, cancelación y resumen."""

    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def create(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            # RN-01: Ningún producto repetido entre los ítems
            vistos: set[int] = set()
            for item in data.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(
                        f"El producto {item.producto_id} está repetido en el pedido"
                    )
                vistos.add(item.producto_id)

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' "
                        f"(disponible: {producto.stock}, solicitado: {item.cantidad})"
                    )

                producto.stock -= item.cantidad
                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.session.add(detalle)
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.flush()

            creado = uow.pedidos.get_with_items(pedido.id)
            return PedidoRead.model_validate(creado)

    def list_pedidos(
        self,
        *,
        usuario_id: int,
        role: str,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if role == "admin" else usuario_id
            total, pedidos = uow.pedidos.list_by_usuario(
                filtro_usuario,
                skip=skip,
                limit=limit,
                estado=estado,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def get_by_id(self, pedido_id: int, *, usuario_id: int, role: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # RN-04: el cliente solo ve sus propios pedidos
            if role != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tienes permiso para ver este pedido")

            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: Restituye el stock de cada línea en la misma transacción."""
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad

    def cambiar_estado(self, pedido_id: int, data: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # RN-02: Validar transición en máquina de estados
            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if data.estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar un pedido de '{pedido.estado}' a '{data.estado}'"
                )

            if data.estado == "CANCELADO":
                self._restituir_stock(uow, pedido)

            pedido.estado = data.estado
            pedido.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            uow.session.flush()

            actualizado = uow.pedidos.get_with_items(pedido_id)
            return PedidoRead.model_validate(actualizado)

    def cancelar_propio(self, pedido_id: int, *, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_with_items(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # RN-04: Solo el dueño puede cancelar desde este endpoint
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tienes permiso para cancelar este pedido")

            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos en estado PENDIENTE"
                )

            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
            uow.session.flush()

            actualizado = uow.pedidos.get_with_items(pedido_id)
            return PedidoRead.model_validate(actualizado)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=round(uow.pedidos.sum_ingresos_entregados(), 2),
            )
