# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de **Programación 4** (UTN — Tecnicatura Universitaria en Programación a Distancia).

Aplicación web full-stack para gestión de catálogo de comidas, carrito de compras, pedidos transaccionales y panel de administración.

## Repositorio y demostración

- **Link al repositorio:** `https://github.com/andresbonelli/UTN-TUPaD-P4-TPI`
- **Link al video:** `<URL_PUBLICA_DEL_VIDEO>`

## Requisitos previos

- **Python:** 3.12+
- **PostgreSQL:** 15+
- **Node.js:** 22+
- **pnpm:** 9+

## Estructura del proyecto

```text
TPI/
├── backend/       # API REST con FastAPI, SQLModel, Unit of Work y PostgreSQL
├── frontend/      # SPA con React, TypeScript (strict), TanStack, Zustand, Axios y Tailwind CSS
└── README.md
```

---

## Instalación y ejecución del Backend

1. Crear la base de datos en PostgreSQL (por ejemplo `foodstore_db`):

   ```bash
   createdb -U postgres foodstore_db
   ```

2. Ir a la carpeta `backend/`, crear y activar el entorno virtual e instalar las dependencias:

   ```bash
   cd backend
   python3.12 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Configurar las variables de entorno copiando `.env.example` a `.env` y completando los valores de conexión y clave secreta:

   ```bash
   cp .env.example .env
   ```

   Variables en `backend/.env`:
   - `DATABASE_URL`: conexión PostgreSQL (`postgresql://postgres:postgres@localhost:5432/foodstore_db`).
   - `SECRET_KEY`: clave secreta para firmar los JWT (mínimo 32 caracteres).
   - `ALGORITHM`: algoritmo JWT (`HS256`).
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: expiración del token y cookie HttpOnly (`30`).
   - `FRONTEND_ORIGIN`: origen permitido por CORS con credenciales (`http://localhost:5173`).

4. Ejecutar el seed inicial (crea las tablas, usuarios de prueba, categorías y productos con stock):

   ```bash
   python -m app.db.seed
   ```

   Credenciales cargadas por el seed:
   - **Administrador:** usuario `admin` / contraseña `Admin1234!` (`role=admin`)
   - **Cliente de prueba:** usuario `juan` / contraseña `Juan1234!` (`role=user`)

5. Iniciar el servidor de desarrollo:

   ```bash
   uvicorn app.main:app --reload
   ```

---

## Instalación y ejecución del Frontend

1. Ir a la carpeta `frontend/` e instalar dependencias con `pnpm`:

   ```bash
   cd frontend
   pnpm install
   ```

2. Configurar las variables de entorno copiando `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

   `frontend/.env`:
   - `VITE_API_URL=http://localhost:8000/api/v1`

3. (Opcional) Verificar compilación y build:

   ```bash
   pnpm build
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   pnpm dev
   ```