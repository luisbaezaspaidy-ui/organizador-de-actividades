
/* Importamos las librerías necesarias */
const express = require("express");
const fs = require("fs").promises;
const path = require("path");

/* Creamos el servidor */
const app = express();
const PORT = 3000;

/* Ubicación del archivo donde guardamos las tareas */
const archivoTareas = path.join(__dirname, "tareas.txt");

/* Permitimos recibir información en formato JSON */
app.use(express.json());

/* Mostramos los archivos del frontend */

app.use(express.static(path.join(__dirname, "../Fronted")));

/* Función para leer las tareas almacenadas */
async function leerTareas() {
    try {
        const contenido = await fs.readFile(archivoTareas, "utf8");

        if (!contenido.trim()) {
            return [];
        }

        return JSON.parse(contenido);
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
}

/* Función para guardar las tareas en el archivo TXT */
async function guardarTareas(tareas) {
    await fs.writeFile(
        archivoTareas,
        JSON.stringify(tareas, null, 2),
        "utf8"
    );
}

/* Validamos los datos de las actividades */
function validarTarea(datos) {
    const { nombre, descripcion, estado } = datos;

    if (typeof nombre !== "string" ||
        !nombre.trim() ||
        nombre.trim().length > 100) {
        return "El nombre es obligatorio y debe tener máximo 100 caracteres.";
    }

    if (typeof descripcion !== "string" ||
        !descripcion.trim() ||
        descripcion.trim().length > 500) {
        return "La descripción es obligatoria y debe tener máximo 500 caracteres.";
    }

    const estadosPermitidos = [
        "Pendiente",
        "En proceso",
        "Terminada"
    ];

    if (!estadosPermitidos.includes(estado)) {
        return "El estado seleccionado no es válido.";
    }

    return null;
}

/* GET: Consultar todas las actividades */
app.get("/api/tareas", async (req, res) => {
    try {
        const tareas = await leerTareas();
        res.json(tareas);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al consultar las actividades."
        });
    }
});

/* POST: Registrar una actividad nueva */
app.post("/api/tareas", async (req, res) => {
    try {
        const error = validarTarea(req.body);

        if (error) {
            return res.status(400).json({ mensaje: error });
        }

        const tareas = await leerTareas();

        const nuevaTarea = {
            id: tareas.length > 0
                ? Math.max(...tareas.map(t => t.id)) + 1
                : 1,
            nombre: req.body.nombre.trim(),
            descripcion: req.body.descripcion.trim(),
            estado: req.body.estado
        };

        tareas.push(nuevaTarea);

        await guardarTareas(tareas);

        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al registrar la actividad."
        });
    }
});

/* PUT: Actualizar una actividad existente */
app.put("/api/tareas/:id", async (req, res) => {
    try {
        const error = validarTarea(req.body);

        if (error) {
            return res.status(400).json({ mensaje: error });
        }

        const tareas = await leerTareas();

        const id = Number(req.params.id);

        const indice = tareas.findIndex(t => t.id === id);

        if (indice === -1) {
            return res.status(404).json({
                mensaje: "Actividad no encontrada."
            });
        }

        tareas[indice] = {
            id,
            nombre: req.body.nombre.trim(),
            descripcion: req.body.descripcion.trim(),
            estado: req.body.estado
        };

        await guardarTareas(tareas);

        res.json(tareas[indice]);
    } catch (error) {
        res.status(500).json({
            mensaje: "Error al actualizar la actividad."
        });
    }
});

/* Iniciamos el servidor */
app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});
