const API_URL = 'http://localhost:3000/api';

const pantalla = document.getElementById('pantalla');
const botones = document.querySelectorAll('button');
const historialBtn = document.getElementById('historial_cal');

let memoriaAns = 0; // Guarda el resultado de la última operación
let operacionActual = '';

// Supongamos que tienes el ID del usuario logueado (por ahora quemamos el 1 de pruebas)
// Tomamos el usuario logueado desde sessionStorage (guardado en login.js)
const usuarioGuardado = JSON.parse(sessionStorage.getItem('usuario'));

// Si no hay sesión activa, regresamos al login
if (!usuarioGuardado) {
    window.location.href = '../index.html';
}

const usuarioIdLogueado = usuarioGuardado.id;

botones.forEach(boton => {
    boton.addEventListener('click', () => {
        const control = boton.dataset.control;
        const valor = boton.dataset.valor;
        const funcion = boton.dataset.funcion;

        // 1. limpia todo lo que haya en la pantalla (C)
        if (control === 'clear') {
            operacionActual = '';
            actualizarPantalla('');
            return;
        }

        // 2. Borrar el ultimo caracter de la pantalla (DEL)
        if (control === 'delete') {
            operacionActual = operacionActual.slice(0, -1);
            actualizarPantalla(operacionActual);
            return;
        }

        // 3. recupera el ultimo resultado que iso la operacion (Ans)
        if (funcion === 'ans') {
            operacionActual += memoriaAns;
            actualizarPantalla(operacionActual);
            return;
        }

        // 4. calcula el resultado que esta escrito en la pantalla (igual)
        if (control === 'igual') {
            try {
                let operacionARegistrar = operacionActual;

                let expresion = operacionActual
                    .replace(/π/g, 'Math.PI')
                    .replace(/√/g, 'Math.sqrt');
                
                let resultado = eval(expresion);
                
                if (resultado % 1 !== 0) {
                    resultado = Number(resultado.toFixed(6));
                }

                pantalla.value = resultado;
                memoriaAns = resultado; 
                operacionActual = resultado.toString(); 

                // Muestra el resultado de forma inmediata en la tabla visual
                actualizarTablaVisual(operacionARegistrar, resultado);

                // =======================================================
                // ¡ACTIVADO!: Envía los datos directamente a MySQL vía Backend
                // =======================================================
                guardarEnBaseDeDatos(operacionARegistrar, resultado);

            } catch (error) {
                pantalla.value = 'Error';
                setTimeout(() => {
                    limpiarTodo();
                }, 1500);
            }
            return;
        }

        // 5. Funciones Científicas (sin, cos, tan, log, ln, √)
        if (funcion) {
            let valorActual = parseFloat(pantalla.value);
            let resultadoCientifico;

            if (isNaN(valorActual)) return;

            switch (funcion) {
                case 'sin':
                    resultadoCientifico = Math.sin(valorActual * Math.PI / 180);
                    break;
                case 'cos':
                    resultadoCientifico = Math.cos(valorActual * Math.PI / 180);
                    break;
                case 'tan':
                    resultadoCientifico = Math.tan(valorActual * Math.PI / 180);
                    break;
                case 'log':
                    resultadoCientifico = Math.log10(valorActual);
                    break;
                case 'ln':
                    resultadoCientifico = Math.log(valorActual);
                    break;
                case 'raiz':
                    resultadoCientifico = Math.sqrt(valorActual);
                    break;
            }

            resultadoCientifico = Number(resultadoCientifico.toFixed(6));
            pantalla.value = resultadoCientifico;
            operacionActual = resultadoCientifico.toString();
            return;
        }

        // 6. Valores por defecto (números, operadores, paréntesis)
        if (valor !== undefined) {
            operacionActual += valor;
            actualizarPantalla(operacionActual);
        }
    });
});

function actualizarPantalla(texto) {
    pantalla.value = texto || '0';
}

function limpiarTodo() {
    operacionActual = '';
    actualizarPantalla('');
}

// =================================================================
// FUNCIÓN COMPLETADA: Envía la operación al backend usando FETCH POST
// =================================================================
function guardarEnBaseDeDatos(operacion, resultado) {
    const datosOperacion = {
        usuario_id: usuarioIdLogueado,
        operacion: operacion,
        resultado: resultado
    };

    fetch(`${API_URL}/historial`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosOperacion)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Operación guardada en MySQL:', data);
    })
    .catch(error => {
        console.error('Error al guardar en la base de datos:', error);
    });
}

// =================================================================
// MODIFICADO: Muestra/Oculta y carga el historial desde el Servidor
// =================================================================
historialBtn.addEventListener('click', () => {
    let contenedor = document.getElementById('contenedor-historial');
    
    if (!contenedor) {
        contenedor = document.querySelector('table').parentElement;
    }

    if (contenedor.style.display === 'none' || contenedor.style.display === '') {
        contenedor.style.display = 'block';
        // Cada vez que se abra la ventana, recarga el historial real de la Base de Datos
        cargarHistorialDesdeServidor();
    } else {
        contenedor.style.display = 'none';
    }
});

// Trae todo el registro guardado en la base de datos
function cargarHistorialDesdeServidor() {
    let tabla = document.querySelector('table');
    if (!tabla) return;

    fetch(`${API_URL}/historial/${usuarioIdLogueado}`)
        .then(response => response.json())
        .then(datos => {
            // Reiniciamos la estructura de la tabla limpia
            tabla.innerHTML = `
                <thead>
                    <tr>
                        <th style="padding: 8px;">Operación</th>
                        <th style="padding: 8px;">Resultado</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
            const tbody = tabla.querySelector('tbody');
            
            // Recorre los registros devueltos por tu consulta SQL
            datos.forEach(fila => {
                const nuevaFila = tbody.insertRow(); // Inserta en orden normal
                const celdaOperacion = nuevaFila.insertCell(0);
                const celdaResultado = nuevaFila.insertCell(1);

                celdaOperacion.textContent = fila.operacion;
                celdaResultado.textContent = fila.resultado;
            });
        })
        .catch(error => console.error('Error al cargar historial de MySQL:', error));
}

// Añade la fila inmediata de forma local para dar velocidad visual
function actualizarTablaVisual(operacion, resultado) {
    let tabla = document.querySelector('table');
    if (!tabla) return; 

    if (tabla.rows.length === 0) {
        tabla.innerHTML = `
            <thead>
                <tr>
                    <th style="padding: 8px;">Operación</th>
                    <th style="padding: 8px;">Resultado</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
    }

    const tbody = tabla.querySelector('tbody');
    const nuevaFila = tbody.insertRow(0); // Inserta arriba del todo

    const celdaOperacion = nuevaFila.insertCell(0);
    const celdaResultado = nuevaFila.insertCell(1);

    celdaOperacion.textContent = operacion;
    celdaResultado.textContent = resultado;
}