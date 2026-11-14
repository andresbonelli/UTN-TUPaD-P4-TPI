"""Router de Pedidos — traduce excepciones de dominio a HTTP."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_pedido(
    data: PedidoCreate,
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.create(current_user.id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("", response_model=PedidosPaginados)
def list_pedidos(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = Query(None),
):
    return service.list_pedidos(
        usuario_id=current_user.id,
        role=current_user.role,
        skip=skip,
        limit=limit,
        estado=estado,
    )


@router.get("/resumen", response_model=ResumenPedidos)
def get_resumen_pedidos(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    return service.obtener_resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def get_pedido(
    pedido_id: Annotated[int, Path(gt=0)],
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.get_by_id(
            pedido_id,
            usuario_id=current_user.id,
            role=current_user.role,
        )
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: Annotated[int, Path(gt=0)],
    data: CambioEstado,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.cambiar_estado(pedido_id, data)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: Annotated[int, Path(gt=0)],
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
):
    try:
        return service.cancelar_propio(pedido_id, usuario_id=current_user.id)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
