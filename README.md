# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de **Programación 4** (UTN — Tecnicatura Universitaria en Programación a Distancia).

Aplicación web full-stack para gestión de catálogo de comidas, carrito de compras, pedidos transaccionales y panel de administración.

## Repositorio y demostración

- **URL del repositorio:** `<URL_DEL_REPOSITORIO_GITHUB>`
- **Video de demostración:** `<URL_PUBLICA_DEL_VIDEO>`

## Requisitos previos

- **Python:** 3.11 a 3.13 (probado con Python 3.12)
- **PostgreSQL:** 15 o superior corriendo localmente en el puerto `5432`
- **Node.js:** 20.19 o superior
- **pnpm:** 9 o superior

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
   - `DATABASE_URL`: cadena de conexión PostgreSQL (`postgresql://postgres:postgres@localhost:5432/foodstore_db`).
   - `SECRET_KEY`: clave para firmar los JWT (mínimo 32 caracteres).
   - `ALGORITHM`: algoritmo JWT (`HS256`).
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: expiración del token y la cookie HttpOnly (`30`).
   - `FRONTEND_ORIGIN`: origen permitido por CORS con credenciales (`http://localhost:5173`).

4. Ejecutar el seed inicial idempotente (crea las tablas, usuarios de prueba, categorías y productos con stock):

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

   La API queda disponible en `http://localhost:8000/api/v1` y la documentación interactiva en `http://localhost:8000/docs` y `http://localhost:8000/redoc`.

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

   Variable en `frontend/.env`:
   - `VITE_API_URL=http://localhost:8000/api/v1`

3. Verificar compilación de tipos y build de producción:

   ```bash
   pnpm build
   ```

4. Iniciar el servidor de desarrollo:

   ```bash
   pnpm dev
   ```

   La aplicación estará disponible en `http://localhost:5173`.
