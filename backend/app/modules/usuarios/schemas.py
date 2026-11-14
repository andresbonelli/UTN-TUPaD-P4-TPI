"""Schemas de entrada y salida para usuarios."""

from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """Datos requeridos para registrar un nuevo usuario con rol 'user'."""

    username: str = Field(min_length=2, max_length=50)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("username", "full_name")
    @classmethod
    def strip_non_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("El campo debe tener al menos 2 caracteres visibles")
        return cleaned


class UserPublic(SQLModel):
    """Vista pública del usuario (nunca expone hashed_password)."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
