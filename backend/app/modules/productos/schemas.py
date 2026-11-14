"""Schemas de entrada y salida para productos."""

from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


class ProductoCreate(SQLModel):
    """Datos para crear un producto."""

    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str = Field(default="")
    precio_base: float = Field(ge=0)
    imagen_url: str = Field(default="")
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    categoria_id: int = Field(gt=0)

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El nombre del producto es obligatorio")
        return cleaned

    @field_validator("descripcion", "imagen_url")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class ProductoUpdate(SQLModel):
    """Datos para actualización parcial de un producto."""

    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = Field(default=None, gt=0)

    @field_validator("nombre")
    @classmethod
    def validate_nombre(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El nombre del producto no puede estar vacío")
        return cleaned

    @field_validator("descripcion", "imagen_url")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None


class ProductoStockUpdate(SQLModel):
    """Datos para actualizar stock y disponibilidad."""

    stock: int = Field(ge=0)
    disponible: bool | None = None


class ProductoRead(SQLModel):
    """Vista de lectura de un producto con su categoría."""

    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    """Respuesta paginada de productos."""

    total: int
    items: list[ProductoRead]
