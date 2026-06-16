// Cargamos las variables de entorno desde el archivo v_entorno.env
require('dotenv').config({ path: './v_entorno.env' });

// =========================================
// IMPORTACIÓN DE MÓDULOS
// =========================================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

// =========================================
// CONFIGURACIÓN DE LA APLICACIÓN
// =========================================
const app = express();
const PORT = process.env.PORT; // Puerto tomado desde el archivo .env

// Middleware: habilita CORS para permitir peticiones desde el frontend
app.use(cors());

// Middleware: convierte el cuerpo JSON de las peticiones en un objeto JavaScript
app.use(express.json());

// =========================================
// RUTA DE PRUEBA
// =========================================
app.get('/', (req, res) => {
    res.json({ mensaje: 'Servidor backend funcionando correctamente' });
});

// =========================================
// ENDPOINT: OBTENER TODOS LOS USUARIOS
// GET /api/usuarios
// =========================================
app.get('/api/usuarios', async (req, res) => {
    try {
        // Seleccionamos todos los campos excepto la contraseña
        const [listaUsuarios] = await db.query(
            'SELECT id, nombre, email, telefono, fecha_registro FROM usuarios'
        );
        res.json({ mensaje: 'Lista de usuarios recuperada exitosamente', usuarios: listaUsuarios });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// ENDPOINT: REGISTRO DE USUARIO
// POST /api/registro
// =========================================
app.post('/api/registro', async (req, res) => {
    try {
        // 1. Extraemos los 4 datos enviados desde el formulario
        const { nombre, email, password, telefono } = req.body;

        // 2. Validación: campos obligatorios vacíos
        if (!nombre || !email || !password || !telefono) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // 3. Validación: formato de correo electrónico
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
            return res.status(400).json({ error: 'El formato del correo no es válido' });
        }

        // 4. Validación: longitud mínima de la contraseña
        if (password.length < 4) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
        }

        // 5. Validación: formato del teléfono (10 dígitos)
        const regexTelefono = /^[0-9]{10}$/;
        if (!regexTelefono.test(telefono)) {
            return res.status(400).json({ error: 'El teléfono debe tener exactamente 10 dígitos' });
        }

        // 6. Verificamos si el correo ya está registrado en la BD
        const [existentes] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if (existentes.length > 0) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        // 7. Ciframos la contraseña antes de guardarla (el 10 es el nivel de seguridad)
        const passwordCifrada = await bcrypt.hash(password, 10);

        // 8. Insertamos el nuevo usuario con la contraseña cifrada
        const [resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordCifrada, telefono]
        );

        // 9. Respuesta exitosa
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: resultado.insertId });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// ENDPOINT: INICIO DE SESIÓN
// POST /api/login
// =========================================
app.post('/api/login', async (req, res) => {
    try {
        // 1. Extraemos correo y contraseña del body
        const { email, password } = req.body;

        // 2. Validación: campos obligatorios
        if (!email || !password) {
            return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
        }

        // 3. Buscamos el usuario por correo (incluimos password para comparar)
        const [usuarios] = await db.query(
            'SELECT id, nombre, email, telefono, password FROM usuarios WHERE email = ?',
            [email]
        );

        // 4. Si no existe el correo, rechazamos
        if (usuarios.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // 5. Comparamos la contraseña ingresada con la cifrada en la BD
        const passwordCorrecta = await bcrypt.compare(password, usuarios[0].password);

        // 6. Si la contraseña no coincide, rechazamos
        if (!passwordCorrecta) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // 7. Respuesta exitosa (sin enviar la contraseña al frontend)
        res.json({ mensaje: 'Inicio de sesión exitoso', usuario: usuarios[0] });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// ENDPOINT: GUARDAR OPERACIÓN DE LA CALCULADORA
// POST /api/historial
// =========================================
app.post('/api/historial', async (req, res) => {
    try {
        const { usuario_id, operacion, resultado } = req.body;

        if (!usuario_id || !operacion || resultado === undefined) {
            return res.status(400).json({ error: 'Faltan datos para guardar el historial' });
        }

        const [resultadoInsert] = await db.query(
            'INSERT INTO historial_operaciones (usuario_id, operacion, resultado) VALUES (?, ?, ?)',
            [usuario_id, operacion, String(resultado)]
        );

        res.status(201).json({ mensaje: 'Operación guardada correctamente', id: resultadoInsert.insertId });
    } catch (error) {
        console.error('Error al guardar historial:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// ENDPOINT: OBTENER HISTORIAL DE UN USUARIO
// GET /api/historial/:usuario_id
// =========================================
app.get('/api/historial/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [historial] = await db.query(
            'SELECT operacion, resultado, fecha FROM historial_operaciones WHERE usuario_id = ? ORDER BY fecha DESC',
            [usuario_id]
        );

        res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// =========================================
// INICIO DEL SERVIDOR
// =========================================
app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
});