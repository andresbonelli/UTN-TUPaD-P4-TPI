"""Schemas del módulo auth (reutiliza UserCreate y UserPublic de usuarios)."""

from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic


class AuthMessage(SQLModel):
    """Respuesta simple de login/logout (el token viaja en cookie HttpOnly)."""

    message: str


__all__ = ["AuthMessage", "UserCreate", "UserPublic"]
