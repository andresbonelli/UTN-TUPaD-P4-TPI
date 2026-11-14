"""Service de Producto con reglas de negocio y excepciones de dominio."""

from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """Se lanza cuando el producto no existe o está dado de baja."""


class CategoriaNoEncontrada(Exception):
    """Se lanza cuando la categoría referenciada no existe o está dada de baja."""


class ProductoService:
    """Orquesta catálogo, stock y baja lógica de productos dentro de un Unit of Work."""

    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def list_paginated(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in productos],
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_with_categoria(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            producto = Producto(
                categoria_id=data.categoria_id,
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
            )
            creado = uow.productos.add(producto)
            cargado = uow.productos.get_active_with_categoria(creado.id)
            return ProductoRead.model_validate(cargado)

    def update(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_with_categoria(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            update_data = data.model_dump(exclude_unset=True)
            if "categoria_id" in update_data and update_data["categoria_id"] is not None:
                nueva_cat = uow.categorias.get_by_id(update_data["categoria_id"])
                if not nueva_cat or not nueva_cat.activo:
                    raise CategoriaNoEncontrada("Categoría no encontrada")

            for key, value in update_data.items():
                if value is not None:
                    setattr(producto, key, value)

            uow.session.flush()
            uow.session.refresh(producto)
            cargado = uow.productos.get_active_with_categoria(producto_id)
            return ProductoRead.model_validate(cargado)

    def update_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_active_with_categoria(producto_id)
            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible

            uow.session.flush()
            uow.session.refresh(producto)
            cargado = uow.productos.get_active_with_categoria(producto_id)
            return ProductoRead.model_validate(cargado)

    def delete(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.session.flush()
