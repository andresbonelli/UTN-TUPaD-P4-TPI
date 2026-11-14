"""Router de Categorías — traduce excepciones de dominio a HTTP."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead])
def list_categorias(
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    return service.list_active()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def get_categoria(
    categoria_id: Annotated[int, Path(gt=0)],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    try:
        return service.get_by_id(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def create_categoria(
    data: CategoriaCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    try:
        return service.create(data)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/{categoria_id}", response_model=CategoriaRead)
def update_categoria(
    categoria_id: Annotated[int, Path(gt=0)],
    data: CategoriaUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    try:
        return service.update(categoria_id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    categoria_id: Annotated[int, Path(gt=0)],
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[CategoriaService, Depends(get_categoria_service)],
):
    try:
        service.delete(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
