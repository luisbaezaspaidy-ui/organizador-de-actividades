/* Obtenemos los elementos HTML */
const formulario = document.getElementById("formTarea");
const listaTareas = document.getElementById("listaTareas");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const btnActualizar = document.getElementById("btnActualizar");

/* Arreglo que almacena temporalmente las actividades */
let tareas = [];



async function consultarTareas() {
    try {
        // Solicitamos las actividades al servidor
        const respuesta = await fetch("/api/tareas");

        // Verificamos que la solicitud sea correcta
        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar las actividades.");
        }

        // Convertimos la respuesta a un arreglo
        tareas = await respuesta.json();

        // Mostramos las actividades en pantalla
        mostrarTareas();

    } catch (error) {
        console.error(error);
        alert("Error al consultar las actividades.");
    }
}




function mostrarTareas() {

    listaTareas.innerHTML = "";

    // Verificamos si existen actividades
    if (tareas.length === 0) {
        listaTareas.textContent = "No hay actividades registradas.";
        return;
    }

    // Recorremos todas las actividades
    tareas.forEach(tarea => {

        // Creamos el contenedor de la actividad
        const contenedor = document.createElement("div");
        contenedor.className = "tarea";

        // Creamos el nombre de la actividad
        const titulo = document.createElement("h3");
        titulo.textContent = tarea.nombre;

        // Creamos la descripción
        const descripcion = document.createElement("p");
        descripcion.textContent = tarea.descripcion;

        // Creamos el estado
        const estado = document.createElement("p");
        estado.className = "estado";
        estado.textContent = "Estado: " + tarea.estado;

        // Creamos el contenedor de botones
        const acciones = document.createElement("div");
        acciones.className = "acciones";

        // Creamos el botón para editar
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";

        // Asignamos la función de edición
        btnEditar.addEventListener("click", () => {
            editarTarea(tarea.id);
        });

        // Agregamos la información al contenedor
        contenedor.appendChild(titulo);
        contenedor.appendChild(descripcion);
        contenedor.appendChild(estado);

        // Agregamos el botón de editar
        acciones.appendChild(btnEditar);
        contenedor.appendChild(acciones);

        // Mostramos la actividad en pantalla
        listaTareas.appendChild(contenedor);
    });
}


formulario.addEventListener("submit", async function (evento) {

    // Evitamos que la página se recargue
    evento.preventDefault();

    // Obtenemos el ID de la actividad
    const id = document.getElementById("idTarea").value;

    // Obtenemos los datos del formulario
    const tarea = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        estado: document.getElementById("estado").value
    };

    // Validamos que los campos estén completos
    if (!tarea.nombre || !tarea.descripcion) {
        alert("Completa todos los campos.");
        return;
    }

    // Comprobamos si estamos editando
    const editando = id !== "";

    // Seleccionamos la dirección correspondiente
    const url = editando
        ? "/api/tareas/" + id
        : "/api/tareas";

    // POST registra y PUT actualiza
    const metodo = editando ? "PUT" : "POST";

    try {

        // Enviamos los datos al servidor
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tarea)
        });

        // Convertimos la respuesta a JSON
        const resultado = await respuesta.json();

        // Verificamos si ocurrió un error
        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "Error al guardar la actividad."
            );
        }

        // Mostramos un mensaje de confirmación
        if (editando) {
            alert("Actividad actualizada correctamente.");
        } else {
            alert("Actividad registrada correctamente.");
        }

        // Limpiamos el formulario
        limpiarFormulario();

        // Actualizamos la lista de actividades
        await consultarTareas();

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
});


function editarTarea(id) {

    // Buscamos la actividad por su ID
    const tarea = tareas.find(t => t.id === id);

    // Verificamos que exista
    if (!tarea) {
        alert("Actividad no encontrada.");
        return;
    }

    // Colocamos los datos en el formulario
    document.getElementById("idTarea").value = tarea.id;
    document.getElementById("nombre").value = tarea.nombre;
    document.getElementById("descripcion").value = tarea.descripcion;
    document.getElementById("estado").value = tarea.estado;

    // Cambiamos el texto del botón principal
    btnGuardar.textContent = "Actualizar actividad";

    // Mostramos el botón de cancelar
    btnCancelar.hidden = false;

    // Regresamos al inicio de la página
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function limpiarFormulario() {

    // Limpiamos los campos del formulario
    formulario.reset();

    // Eliminamos el ID de edición
    document.getElementById("idTarea").value = "";

    // Restauramos el botón principal
    btnGuardar.textContent = "Registrar actividad";

    // Ocultamos el botón cancelar
    btnCancelar.hidden = true;
}


// Cancelar la edición
btnCancelar.addEventListener("click", limpiarFormulario);

// Consultar las actividades manualmente
btnActualizar.addEventListener("click", consultarTareas);

// Consultar las actividades al abrir la página
consultarTareas();
