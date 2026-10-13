
const formulario = document.getElementById("formConcepto");
const listaConceptos = document.getElementById("listaConceptos");

formulario.addEventListener("submit", async function(evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    if (nombre === "" || descripcion === "") {
        alert("Completá todos los campos");
        return;
    }

    try {
        const respuesta = await fetch("/conceptos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, descripcion })
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo agregar el concepto");
        }

        formulario.reset();
        await cargarConceptos();
        alert("Concepto agregado correctamente");
    } catch (error) {
        alert(error.message);
    }
});

async function cargarConceptos() {
    try {
        const respuesta = await fetch("/conceptos");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los conceptos");
        }

        const conceptos = await respuesta.json();
        listaConceptos.innerHTML = "";

        if (conceptos.length === 0) {
            listaConceptos.textContent = "No hay conceptos registrados.";
            return;
        }

        conceptos.forEach(function(concepto) {
            const div = document.createElement("div");
            div.className = "concepto";

            const titulo = document.createElement("h3");
            titulo.textContent = concepto.nombre;

            const descripcion = document.createElement("p");
            descripcion.textContent = concepto.descripcion;

            const boton = document.createElement("button");
            boton.className = "eliminar";
            boton.textContent = "Eliminar";

            boton.addEventListener("click", function() {
                eliminarConcepto(concepto.id);
            });

            div.appendChild(titulo);
            div.appendChild(descripcion);
            div.appendChild(boton);

            listaConceptos.appendChild(div);
        });
    } catch (error) {
        alert(error.message);
    }
}

async function eliminarConcepto(id) {
    if (!confirm("¿Querés eliminar este concepto?")) {
        return;
    }

    try {
        const respuesta = await fetch("/conceptos/" + id, {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudo eliminar el concepto");
        }

        await cargarConceptos();
        alert("Concepto eliminado correctamente");
    } catch (error) {
        alert(error.message);
    }
}

async function eliminarTodos() {
    if (!confirm("¿Querés eliminar todos los conceptos?")) {
        return;
    }

    try {
        const respuesta = await fetch("/conceptos", {
            method: "DELETE"
        });

        if (!respuesta.ok) {
            throw new Error("No se pudieron eliminar los conceptos");
        }

        await cargarConceptos();
        alert("Todos los conceptos fueron eliminados");
    } catch (error) {
        alert(error.message);
    }
}

cargarConceptos();
