"""Service de gestión de usuarios (administración)."""

from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Lógica de negocio para listado, activación y desactivación de usuarios."""

    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def list_all(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all_ordered()
            return [UserPublic.model_validate(u) for u in usuarios]

    def set_disabled(
        self,
        user_id: int,
        disabled: bool,
        current_admin_id: int,
    ) -> UserPublic:
        with self.uow as uow:
            user = uow.usuarios.get_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado",
                )

            if disabled and user.id == current_admin_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No puedes desactivar tu propia cuenta",
                )

            user.disabled = disabled
            uow.session.flush()
            uow.session.refresh(user)
            return UserPublic.model_validate(user)
