"""Router de administración de usuarios."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def list_users(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
):
    return service.list_all()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activate_user(
    user_id: int,
    admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
):
    return service.set_disabled(user_id, disabled=False, current_admin_id=admin.id)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def deactivate_user(
    user_id: int,
    admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    service: Annotated[UsuarioService, Depends(get_usuario_service)],
):
    return service.set_disabled(user_id, disabled=True, current_admin_id=admin.id)
