"""Service de Categoría con reglas de negocio y excepciones de dominio."""

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """Se lanza cuando la categoría no existe o fue dada de baja."""


class NombreDuplicado(Exception):
    """Se lanza cuando ya existe una categoría con el mismo nombre."""


class CategoriaService:
    """Orquesta operaciones CRUD y baja lógica de categorías dentro de un Unit of Work."""

    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def list_active(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all_active()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")

            categoria = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True,
            )
            creada = uow.categorias.add(categoria)
            return CategoriaRead.model_validate(creada)

    def update(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")

            update_data = data.model_dump(exclude_unset=True)
            if "nombre" in update_data and update_data["nombre"] is not None:
                if uow.categorias.exists_nombre_excluding(update_data["nombre"], categoria_id):
                    raise NombreDuplicado(
                        f"Ya existe una categoría con el nombre '{update_data['nombre']}'"
                    )

            for key, value in update_data.items():
                if value is not None:
                    setattr(categoria, key, value)

            uow.session.flush()
            uow.session.refresh(categoria)
            return CategoriaRead.model_validate(categoria)

    def delete(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.session.flush()
