"""Router de Productos — traduce excepciones de dominio a HTTP."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def list_productos(
    service: Annotated[ProductoService, Depends(get_producto_service)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categoria_id: int | None = Query(None, gt=0),
    disponible: bool | None = Query(None),
):
    return service.list_paginated(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def get_producto(
    producto_id: Annotated[int, Path(gt=0)],
    service: Annotated[ProductoService, Depends(get_producto_service)],
):
    try:
        return service.get_by_id(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def create_producto(
    data: ProductoCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
):
    try:
        return service.create(data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{producto_id}", response_model=ProductoRead)
def update_producto(
    producto_id: Annotated[int, Path(gt=0)],
    data: ProductoUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
):
    try:
        return service.update(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def update_producto_stock(
    producto_id: Annotated[int, Path(gt=0)],
    data: ProductoStockUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
):
    try:
        return service.update_stock(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    producto_id: Annotated[int, Path(gt=0)],
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[ProductoService, Depends(get_producto_service)],
):
    try:
        service.delete(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
