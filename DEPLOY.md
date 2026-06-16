# Guía de Despliegue Local - Proyecto Login + Calculadora

istructor esta documentacion fue realizada implementando la ia claude.

Este proyecto es una aplicación web compuesta por:

- **Backend**: Node.js + Express + MySQL (carpeta `backend/`)
- **Frontend**: HTML/CSS/JS estático (carpeta `frontend/`)
- **Base de datos**: MySQL (script en `database/script.sql`)

## 1. Requisitos previos

Instala en tu PC:

- **Node.js** (v18 o superior recomendado) – incluye npm
- **MySQL Server** (puede ser MySQL local, XAMPP, WAMP o MariaDB compatible)
- Un editor (VS Code recomendado) o solo terminal
- Opcional: extensión "Live Server" de VS Code, o cualquier servidor estático para el frontend

## 2. Estructura del proyecto

```
proyecto-login/
├── database/
│   └── script.sql        # Script para crear la BD y tablas
├── backend/
│   ├── server.js         # Servidor Express (API)
│   ├── db.js             # Conexión a MySQL
│   ├── v_entorno.env      # Variables de entorno
│   └── package.json
└── frontend/
    ├── index.html         # Login
    ├── registro.html       # Registro de usuario
    ├── bienvenida.html     # Página de bienvenida
    ├── listado.html        # Listado de usuarios
    ├── js/                  # Scripts del frontend
    └── calculadora/         # Módulo calculadora
```

## 3. Configurar la base de datos

1. Abre tu cliente de MySQL (MySQL Workbench, phpMyAdmin, o terminal `mysql`).
2. Ejecuta el script `database/script.sql`. Esto hará lo siguiente:
   - Crea la base de datos `login_db`
   - Crea las tablas `usuarios` y `historial_operaciones`
   - Inserta un usuario de prueba

Desde terminal, por ejemplo:

```bash
mysql -u root -p < database/script.sql
```

> **Nota**: El script empieza con `DROP DATABASE IF EXISTS login_db;`, así que si ya tienes una base de datos con ese nombre, será eliminada y recreada.

## 4. Configurar el backend

1. Entra a la carpeta `backend`:

```bash
cd backend
```

2. Instala las dependencias (esto creará `node_modules`):

```bash
npm install
```

3. Revisa el archivo `v_entorno.env` y ajusta según tu configuración local de MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=login_db
```

- `DB_USER` y `DB_PASSWORD` deben coincidir con tu usuario/contraseña de MySQL.
- Si tu MySQL tiene contraseña para `root`, complétala en `DB_PASSWORD`.

4. Inicia el servidor backend:

```bash
npm start
```

Si todo está correcto, verás en consola:

```
✓ Conexión a MySQL exitosa
✓ Servidor corriendo en http://localhost:3000
```

> Si usas `nodemon` (incluido como dependencia de desarrollo) puedes ejecutar `npx nodemon server.js` para que el servidor se reinicie automáticamente al guardar cambios.

### Endpoints disponibles del backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Verifica que el servidor está activo |
| GET | `/api/usuarios` | Lista todos los usuarios registrados |
| POST | `/api/registro` | Registra un nuevo usuario |
| POST | `/api/login` | Inicia sesión |
| POST | `/api/historial` | Guarda una operación de la calculadora |
| GET | `/api/historial/:usuario_id` | Obtiene el historial de un usuario |

## 5. Configurar y ejecutar el frontend

El frontend es estático (HTML/CSS/JS) y se comunica con el backend mediante `fetch` a `http://localhost:3000/api`. Esta URL está fijada en los archivos:

- `frontend/js/login.js`
- `frontend/js/registro.js`
- `frontend/js/listado.js`
- `frontend/calculadora/calculadora.js`

Por eso es importante que el **backend esté corriendo en el puerto 3000** (o que actualices la constante `API_URL` en esos archivos si usas otro puerto).

Para abrir el frontend tienes dos opciones:

### Opción A: Abrir directamente los archivos HTML
Haz doble clic en `frontend/index.html` para abrirlo en el navegador. Funciona en la mayoría de los casos, ya que las peticiones van hacia `http://localhost:3000`.

### Opción B: Servidor estático (recomendado)
Para evitar problemas de CORS o de rutas relativas, sirve la carpeta `frontend` con un servidor local. Por ejemplo, usando la extensión **Live Server** de VS Code, o con `npx`:

```bash
cd frontend
npx serve .
```

Luego abre la URL que indique (por ejemplo `http://localhost:3000`... **cuidado**: si usas el puerto 3000 para el frontend, chocará con el backend. Usa otro puerto, por ejemplo `npx serve . -l 5500`).

## 6. Flujo de uso

1. Asegúrate de que **MySQL esté corriendo** y que la base de datos `login_db` exista (paso 3).
2. Inicia el **backend** (`npm start` dentro de `backend/`), que debe quedar escuchando en `http://localhost:3000`.
3. Abre `frontend/index.html` (o el servidor estático) en el navegador.
4. Desde ahí puedes:
   - Iniciar sesión con el usuario de prueba: `aprendiz@sena.edu.co` / contraseña `12345` *(nota: esta contraseña en la BD de prueba NO está cifrada con bcrypt, por lo que el login fallará con ese usuario hasta que lo registres de nuevo desde el formulario de registro)*.
   - Registrar un nuevo usuario desde `registro.html`.
   - Ver el listado de usuarios en `listado.html`.
   - Usar la calculadora y guardar el historial de operaciones.

## 7. Solución de problemas comunes

- **Error "✗ Error al conectar a MySQL"**: verifica que el servicio de MySQL esté iniciado y que usuario/contraseña en `v_entorno.env` sean correctos.
- **Error de CORS en el navegador**: el backend ya tiene habilitado `cors()`, pero asegúrate de que el backend esté corriendo en `localhost:3000`.
- **Puerto 3000 ocupado**: cambia el valor de `PORT` en `v_entorno.env` y actualiza la constante `API_URL` en los archivos JS del frontend.
- **El login con el usuario de prueba no funciona**: la contraseña insertada por el script SQL (`12345`) no está cifrada con bcrypt como lo requiere el backend. Registra un nuevo usuario desde la interfaz para probar el flujo completo.

## 8. Resumen rápido (TL;DR)

```bash
# 1. Crear base de datos
mysql -u root -p < database/script.sql

# 2. Backend
cd backend
npm install
npm start

# 3. Frontend (en otra terminal)
cd frontend
npx serve . -l 5500
```

Luego abre `http://localhost:5500` (o el archivo `index.html` directamente) en tu navegador.
