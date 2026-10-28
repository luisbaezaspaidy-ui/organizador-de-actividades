// Obtiene los elementos HTML que se utilizaran

const formulario =
    document.getElementById("formTarea");
const listaTareas =
    document.getElementById("listatareas");
const btnGuardar =
    document.getElementById("btnGuardar");
const btnCancelar =
    document.getElementById("btnCancelar");
const btnActualizar =
    document.getElementById("btnActualizar");


// Obtiene los elementos HTML que se utilizarán
const formulario = document.getElementById("formTarea");
const listaTareas = document.getElementById("listaTareas");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnActualizar = document.getElementById("btnActualizar");

// Arreglo que almacena temporalmente las actividades consultadas
let tareas = [];

// Función para consultar las actividades guardadas en el servidor
async function consultarTareas() {
    try {
        // Solicita al servidor la lista de actividades
        const respuesta = await fetch("/api/tareas");

        // Comprueba que la solicitud haya sido correcta
        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar las actividades");
        }

        // Convierte la respuesta del servidor a un arreglo
        tareas = await respuesta.json();

        // Muestra las actividades en la página
        mostrarTareas();

    } catch (error) {
        // Muestra un mensaje cuando ocurre un error
        console.error(error);
        alert("Error al consultar las actividades");
    }
}

// Función para mostrar las actividades en pantalla
function mostrarTareas() {

    // Limpia la lista antes de mostrar los registros
    listaTareas.innerHTML = "";

    // Verifica si todavía no existen actividades
    if (tareas.length === 0) {
        listaTareas.textContent = "No hay actividades registradas.";
        return;
    }

    // Recorre cada actividad del arreglo
    tareas.forEach(tarea => {

        // Crea un contenedor para la actividad
        const contenedor = document.createElement("div");
        contenedor.className = "tarea";

        // Crea el elemento para mostrar el nombre
        const titulo = document.createElement("h3");
        titulo.textContent = tarea.nombre;

        // Crea el elemento para mostrar la descripción
        const descripcion = document.createElement("p");
        descripcion.textContent = tarea.descripcion;

        // Crea el elemento para mostrar el estado
        const estado = document.createElement("p");
        estado.className = "estado";
        estado.textContent = "Estado: " + tarea.estado;

        // Crea un contenedor para los botones
        const acciones = document.createElement("div");
        acciones.className = "acciones";

        // Crea el botón para editar una actividad
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";

        // Al presionar el botón, carga los datos para editarlos
        btnEditar.addEventListener("click", () => editarTarea(tarea.id));

        // Agrega los datos al contenedor de la actividad
        contenedor.appendChild(titulo);
        contenedor.appendChild(descripcion);
        contenedor.appendChild(estado);

        // Agrega el botón de editar
        acciones.appendChild(btnEditar);
        contenedor.appendChild(acciones);

        // Agrega la actividad a la lista de la página
        listaTareas.appendChild(contenedor);
    });
}

// Detecta cuando el usuario envía el formulario
formulario.addEventListener("submit", async function (evento) {

    // Evita que la página se recargue automáticamente
    evento.preventDefault();

    // Obtiene el ID si se está editando una actividad
    const id = document.getElementById("idTarea").value;

    // Obtiene los datos ingresados en el formulario
    const tarea = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        estado: document.getElementById("estado").value
    };

    // Comprueba que los campos obligatorios estén completos
    if (!tarea.nombre || !tarea.descripcion) {
        alert("Completa todos los campos.");
        return;
    }

    // Identifica si se registrará o actualizará una actividad
    const editando = id !== "";

    // Selecciona la dirección del servidor
    const url = editando
        ? "/api/tareas/" + id
        : "/api/tareas";

    // POST registra y PUT actualiza
    const metodo = editando ? "PUT" : "POST";

    try {
        // Envía la información al servidor
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tarea)
        });

        // Obtiene el resultado de la solicitud
        const resultado = await respuesta.json();

        // Comprueba si ocurrió algún error
        if (!respuesta.ok) {
            throw new Error(resultado.mensaje || "Error al guardar");
        }

        // Muestra el mensaje enviado por el servidor
        alert(resultado.mensaje);

        // Limpia el formulario después de guardar
        limpiarFormulario();

        // Consulta nuevamente las actividades
        await consultarTareas();

    } catch (error) {
        // Muestra el error ocurrido
        alert(error.message);
    }
});

// Función para editar una actividad
function editarTarea(id) {

    // Busca la actividad mediante su ID
    const tarea = tareas.find(t => t.id === id);

    // Verifica que la actividad exista
    if (!tarea) {
        alert("Actividad no encontrada");
        return;
    }

    // Coloca los datos de la actividad en el formulario
    document.getElementById("idTarea").value = tarea.id;
    document.getElementById("nombre").value = tarea.nombre;
    document.getElementById("descripcion").value = tarea.descripcion;
    document.getElementById("estado").value = tarea.estado;

    // Cambia el botón para indicar que se actualizará
    btnGuardar.textContent = "Actualizar actividad";

    // Muestra el botón para cancelar la edición
    btnCancelar.hidden = false;

    // Regresa al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Función para limpiar los datos del formulario
function limpiarFormulario() {

    // Limpia todos los campos
    formulario.reset();

    // Elimina el ID de la actividad que se estaba editando
    document.getElementById("idTarea").value = "";

    // Restaura el texto del botón principal
    btnGuardar.textContent = "Registrar actividad";

    // Oculta el botón para cancelar
    btnCancelar.hidden = true;
}

// Permite cancelar una edición
btnCancelar.addEventListener("click", limpiarFormulario);

// Permite consultar manualmente las actividades
btnActualizar.addEventListener("click", consultarTareas);

// Consulta las actividades al abrir la página
consultarTareas();