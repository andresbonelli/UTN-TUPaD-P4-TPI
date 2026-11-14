"""Schemas de entrada y salida para categorías."""

from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    """Datos para crear una categoría."""

    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="")

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2 or len(cleaned) > 100:
            raise ValueError("El nombre debe tener entre 2 y 100 caracteres")
        return cleaned

    @field_validator("descripcion")
    @classmethod
    def strip_descripcion(cls, value: str) -> str:
        return value.strip()


class CategoriaUpdate(SQLModel):
    """Datos para actualización parcial de una categoría."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if len(cleaned) < 2 or len(cleaned) > 100:
            raise ValueError("El nombre debe tener entre 2 y 100 caracteres")
        return cleaned

    @field_validator("descripcion")
    @classmethod
    def strip_descripcion(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None


class CategoriaRead(SQLModel):
    """Vista de lectura de una categoría."""

    id: int
    nombre: str
    descripcion: str
    activo: bool
