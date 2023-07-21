const express = require("express");
const server = express();

// Middleware: Establece el manejo de datos en formato JSON
/*You NEED express.json() and express.urlencoded() for POST and PUT requests, 
because in both these requests you are sending data (in the form of some data object)
to the server and you are asking the server to accept or store that data (object), */
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// | GET | http://127.0.0.1:3005/api/v1/muebles | Obtiene los registros (permite filtros) |
server.get('/api/v1/muebles', async (req, res) => {

});

// | GET | http://127.0.0.1:3005/api/v1/muebles/1 | Obtiene un registro en específico |
server.get('/api/v1/muebles/:codigo', async (req, res) => {

});

// | POST | http://127.0.0.1:3005/api/v1/muebles | Crea un nuevo registro |
server.post('/api/v1/muebles', async (req, res) => {

});

// | PUT | http://127.0.0.1:3005/api/v1/muebles/1 | Modifica un registro en específico |
server.put('/api/v1/muebles/:codigo', async (req, res) => {

});

// | DELETE | http://127.0.0.1:3005/api/v1/muebles/1 | Elimina un registro en específico |
server.delete('/api/v1/muebles/:codigo', async (req, res) => {

});

// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
});