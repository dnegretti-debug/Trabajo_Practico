
const http = require("http");
const fs = require("fs");
const path = require("path");

let conceptos = [];
let siguienteId = 1;

const servidor = http.createServer((req, res) => {
    const ruta = new URL(req.url, "http://localhost").pathname;

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (ruta === "/conceptos" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify(conceptos));
        return;
    }

    if (ruta.startsWith("/conceptos/") && req.method === "GET") {
        const id = Number(ruta.split("/")[2]);
        const concepto = conceptos.find(c => c.id === id);

        res.writeHead(concepto ? 200 : 404);
        res.end(JSON.stringify(concepto || {
            error: "Concepto no encontrado"
        }));
        return;
    }

    if (ruta === "/conceptos" && req.method === "POST") {
        let datos = "";

        req.on("data", parte => datos += parte);

        req.on("end", () => {
            try {
                const nuevo = JSON.parse(datos);

                if (
                    typeof nuevo.nombre !== "string" ||
                    typeof nuevo.descripcion !== "string" ||
                    !nuevo.nombre.trim() ||
                    !nuevo.descripcion.trim()
                ) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        error: "Completá nombre y descripción"
                    }));
                    return;
                }

                const concepto = {
                    id: siguienteId++,
                    nombre: nuevo.nombre.trim(),
                    descripcion: nuevo.descripcion.trim()
                };

                conceptos.push(concepto);

                res.writeHead(201);
                res.end(JSON.stringify(concepto));
            } catch {
                res.writeHead(400);
                res.end(JSON.stringify({
                    error: "Datos inválidos"
                }));
            }
        });
        return;
    }

    if (ruta === "/conceptos" && req.method === "DELETE") {
        conceptos = [];
        res.writeHead(200);
        res.end(JSON.stringify({
            mensaje: "Todos los conceptos eliminados"
        }));
        return;
    }

    if (ruta.startsWith("/conceptos/") && req.method === "DELETE") {
        const id = Number(ruta.split("/")[2]);
        const indice = conceptos.findIndex(c => c.id === id);

        if (indice === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({
                error: "Concepto no encontrado"
            }));
            return;
        }

        conceptos.splice(indice, 1);
        res.writeHead(200);
        res.end(JSON.stringify({
            mensaje: "Concepto eliminado"
        }));
        return;
    }

    const archivos = {
        "/": "Web.html",
        "/Web.html": "Web.html",
        "/app.js": "app.js",
        "/style.css": "style.css"
    };

    if (req.method === "GET" && archivos[ruta]) {
        const archivo = path.join(__dirname, archivos[ruta]);

        const tipos = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css"
        };

        fs.readFile(archivo, (error, contenido) => {
            if (error) {
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: "Error al leer archivo"
                }));
                return;
            }

            res.writeHead(200, {
                "Content-Type": tipos[path.extname(archivo)] + "; charset=utf-8"
            });
            res.end(contenido);
        });
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({
        error: "Ruta no encontrada"
    }));
});

servidor.listen(3000, () => {
    console.log("Servidor funcionando en http://localhost:3000");
});
