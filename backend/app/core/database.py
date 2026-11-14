from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)


def session_factory() -> Session:
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    import app.modules.usuarios.models 
    import app.modules.categorias.models 
    import app.modules.productos.models  
    import app.modules.pedidos.models 

    SQLModel.metadata.create_all(engine)
