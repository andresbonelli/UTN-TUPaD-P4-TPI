"""Script de seed para Food Store.

Uso:
    python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS_INICIALES = [
    {
        "username": "admin",
        "full_name": "Administrador Food Store",
        "email": "admin@foodstore.com",
        "password": "Admin1234!",
        "role": "admin",
    },
    {
        "username": "juan",
        "full_name": "Juan Pérez",
        "email": "juan@foodstore.com",
        "password": "Juan1234!",
        "role": "user",
    },
]

CATEGORIAS_INICIALES = [
    {
        "nombre": "Hamburguesas",
        "descripcion": "Hamburguesas artesanales a la parrilla con pan brioche",
    },
    {
        "nombre": "Pizzas",
        "descripcion": "Pizzas a la piedra con masa madre y muzzarella",
    },
    {
        "nombre": "Empanadas",
        "descripcion": "Empanadas salteñas y tucumanas al horno de barro",
    },
    {
        "nombre": "Bebidas",
        "descripcion": "Gaseosas, aguas saborizadas y cervezas artesanales",
    },
]

PRODUCTOS_INICIALES = [
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Clásica Doble",
        "descripcion": "Doble medallón de carne 180g, cheddar fundido, lechuga, tomate y salsa de la casa.",
        "precio_base": 9500.0,
        "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop",
        "stock": 25,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Bacon Crispy",
        "descripcion": "Medallón smash, panceta crocante, cebolla caramelizada y barbacoa ahumada.",
        "precio_base": 10800.0,
        "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop",
        "stock": 20,
    },
    {
        "categoria": "Hamburguesas",
        "nombre": "Burger Veggie Portobello",
        "descripcion": "Medallón de portobello y garbanzos, queso provolone, rúcula y alioli.",
        "precio_base": 8900.0,
        "imagen_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop",
        "stock": 15,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Muzzarella",
        "descripcion": "Salsa de tomate casera, abundante muzzarella, aceitunas verdes y orégano.",
        "precio_base": 11200.0,
        "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop",
        "stock": 18,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Napolitana Especial",
        "descripcion": "Muzzarella, rodajas de tomate fresco, ajo confitado y albahaca.",
        "precio_base": 12400.0,
        "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop",
        "stock": 14,
    },
    {
        "categoria": "Pizzas",
        "nombre": "Pizza Pepperoni",
        "descripcion": "Base de tomate italiano, muzzarella y láminas de pepperoni picante.",
        "precio_base": 13200.0,
        "imagen_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop",
        "stock": 16,
    },
    {
        "categoria": "Empanadas",
        "nombre": "Empanada Carne Cortada a Cuchillo",
        "descripcion": "Unidad al horno con carne vacuna cortada a cuchillo, huevo y verdeo.",
        "precio_base": 1600.0,
        "imagen_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",
        "stock": 60,
    },
    {
        "categoria": "Empanadas",
        "nombre": "Empanada Jamón y Queso",
        "descripcion": "Rellena con jamón cocido natural y queso muzzarella fundido.",
        "precio_base": 1500.0,
        "imagen_url": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop",
        "stock": 50,
    },
    {
        "categoria": "Bebidas",
        "nombre": "Limonada con Menta y Jengibre",
        "descripcion": "Botella de 500 ml recién exprimida con menta fresca y toque de jengibre.",
        "precio_base": 3200.0,
        "imagen_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop",
        "stock": 30,
    },
    {
        "categoria": "Bebidas",
        "nombre": "Cerveza Artesanal IPA 473ml",
        "descripcion": "Lata de cerveza artesanal estilo IPA lupulada bien fría.",
        "precio_base": 4500.0,
        "imagen_url": "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&auto=format&fit=crop",
        "stock": 24,
    },
]


def run() -> None:
    print("=== Seed Food Store (PostgreSQL) ===")
    create_all_tables()

    with Session(engine) as session:
        # Usuarios
        for data in USUARIOS_INICIALES:
            existing = session.exec(
                select(Usuario).where(Usuario.username == data["username"])
            ).first()
            if existing:
                print(f"  [=] Usuario ya existe: {data['username']} ({data['role']})")
            else:
                usuario = Usuario(
                    username=data["username"],
                    full_name=data["full_name"],
                    email=data["email"],
                    hashed_password=hash_password(data["password"]),
                    role=data["role"],
                )
                session.add(usuario)
                print(f"  [+] Usuario creado:    {data['username']} / {data['password']} ({data['role']})")

        session.flush()

        # Categorías
        categorias_map: dict[str, Categoria] = {}
        for cat_data in CATEGORIAS_INICIALES:
            existing_cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_data["nombre"])
            ).first()
            if existing_cat:
                categorias_map[cat_data["nombre"]] = existing_cat
                print(f"  [=] Categoría ya existe: {cat_data['nombre']}")
            else:
                cat = Categoria(
                    nombre=cat_data["nombre"],
                    descripcion=cat_data["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
                session.refresh(cat)
                categorias_map[cat_data["nombre"]] = cat
                print(f"  [+] Categoría creada:    {cat_data['nombre']}")

        # Productos
        for prod_data in PRODUCTOS_INICIALES:
            existing_prod = session.exec(
                select(Producto).where(Producto.nombre == prod_data["nombre"])
            ).first()
            if existing_prod:
                print(f"  [=] Producto ya existe:  {prod_data['nombre']}")
            else:
                cat = categorias_map[prod_data["categoria"]]
                assert cat.id is not None
                prod = Producto(
                    categoria_id=cat.id,
                    nombre=prod_data["nombre"],
                    descripcion=prod_data["descripcion"],
                    precio_base=prod_data["precio_base"],
                    imagen_url=prod_data["imagen_url"],
                    stock=prod_data["stock"],
                    disponible=True,
                    activo=True,
                )
                session.add(prod)
                print(f"  [+] Producto creado:     {prod_data['nombre']} (stock={prod_data['stock']})")

        session.commit()

    print("\nSeed completado correctamente.")


if __name__ == "__main__":
    run()
