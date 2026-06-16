-- Eliminamos la base de datos si ya existe (útil al re-ejecutar)
DROP DATABASE IF EXISTS login_db;

-- Creamos la base de datos
CREATE DATABASE login_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Seleccionamos la base de datos para trabajar sobre ella
USE login_db;

-- Creamos la tabla de usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NULL, 
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    historialcalculadora JSON NULL 
);

-- Creamos la tabla independiente para el historial

CREATE TABLE historial_operaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL, 
    operacion VARCHAR(255) NOT NULL,
    resultado VARCHAR(255) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- Insertamos un usuario de prueba (opcional)
-- (Añadimos 'telefono' y 'historialcalculadora' en las columnas y un número de prueba en los VALUES)
INSERT INTO usuarios (nombre, email, password, telefono, historialcalculadora)
VALUES ('Aprendiz SENA', 'aprendiz@sena.edu.co', '12345', '+573001234567', '[]');

INSERT INTO historial_operaciones (usuario_id, operacion, resultado) 
VALUES (1, '25 + 75', '100');

SELECT operacion, resultado FROM historial_operaciones WHERE usuario_id = 1 ORDER BY fecha DESC;

-- Verificamos que se haya creado
SELECT * FROM usuarios;