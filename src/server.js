const express = require("express");
const server = express();

//const conexion = require('../connection_db');
const { connectToCollection, disconnect, crearCodigo } = require('../connection_db.js');

// Middleware: Establece el manejo de datos en formato JSON
/*You NEED express.json() and express.urlencoded() for POST and PUT requests, 
because in both these requests you are sending data (in the form of some data object)
to the server and you are asking the server to accept or store that data (object), */
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// | GET | http://127.0.0.1:3005/api/v1/muebles | Obtiene los registros (permite filtros) |
server.get('/api/v1/muebles', async (req, res) => {

    const { categoria, precio_gte, precio_lte } = req.query;
    const filtros = {};

    if (categoria) filtros.categoria = categoria;
    if (precio_gte) filtros.precio = { $gte: Number(precio_gte) }
    if (precio_lte) filtros.precio = { $lte: Number(precio_lte) } 

    let muebles = [];

    try {
        const collection = await connectToCollection('muebles');
        muebles = await collection.find(filtros).sort({ codigo: 1 }).toArray();
        await disconnect();
        
        //if(muebles.length == 0) return res.status(404).send('Error. No hay muebles con la descripción dada');
        res.status(200).send({ payload: muebles });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Se ha generado un error en el servidor' });
    }
    
});

// | GET | http://127.0.0.1:3005/api/v1/muebles/1 | Obtiene un registro en específico |
server.get('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        const mueble = await collection.findOne({ codigo: Number(codigo) });
        await disconnect();
        
        if(mueble === null ) return res.status(400).send({ message:'El código no corresponde a un mueble registrado' });
        res.status(200).send({ payload: mueble });
    } catch (error) {
        //console.log(error.message);
        res.status(500).send({ message: 'Se ha generado un error en el servidor' });
    }
}); 

// | POST | http://127.0.0.1:3005/api/v1/muebles | Crea un nuevo registro |
server.post('/api/v1/muebles', async (req, res) => {
    const { nombre, precio, categoria } = req.body;
    
    if(!nombre || !precio || !categoria) {
        return res.status(400).send({ message: 'Faltan datos relevantes' })
    }
    
    let data = { nombre, precio: Number(precio), categoria};
    
    
    try {
        const collection = await connectToCollection('muebles');
        let doc = { codigo: await crearCodigo(collection), ...data};
    
        await collection.insertOne(doc);
        await disconnect();
        
        res.status(200).send({ message: 'Registro creado', payload: doc });
    } catch (error) {
        //console.log(error.message);
        res.status(500).send({ message: 'Se ha generado un error en el servidor' });
    }

});

// | PUT | http://127.0.0.1:3005/api/v1/muebles/1 | Modifica un registro en específico |
server.put('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { nombre, precio, categoria } = req.body;
    
    if(!nombre || !precio || !categoria) {
        return res.status(400).send({ message: 'Faltan datos relevantes' })
    }
    
    let data = { nombre, precio: Number(precio), categoria};

    try {
        const collection = await connectToCollection('muebles');
        let mueble = await collection.findOne({ codigo: Number(codigo) });

        if (!mueble) return res.status(400).send({ message: 'El código no corresponde a un mueble registrado' });
        mueble.nombre = nombre;
        mueble.precio = Number(precio);
        mueble.categoria = categoria;

        await collection.updateOne({ codigo: Number(codigo) }, { $set: mueble });
        await disconnect();
        res.status(200).send( { message: 'Registro actualizado', payload: { codigo, ...mueble } });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Se ha generado un error en el servidor' });
    } 
});
/*

#### Método DELETE:
- Request:
  - Parámetro obligatorio de tipo URL:
    - 16 *(tipo: integer. Indica el código del mueble que se requiere eliminar)*
- Response:
  - Código HTTP: **200** *message: 'Registro eliminado'*
  - Código HTTP: **500** *message: Se ha generado un error en el servidor*
- Nota: *Los valores indicados en el ejemplo, son datos esperados en los tests.*
*/

// | DELETE | http://127.0.0.1:3005/api/v1/muebles/1 | Elimina un registro en específico |
server.delete('/api/v1/muebles/:codigo', async (req, res) => {
    const { codigo } = req.params;

    try {
        const collection = await connectToCollection('muebles');
        let mueble = await collection.findOne({ codigo: Number(codigo) });
        console.log(mueble);
        if (!mueble) return res.status(400).send({ message: 'El código no corresponde a un mueble registrado' });

       
        await collection.deleteOne({ codigo: Number(codigo) });
        await disconnect();

        res.status(200).send(JSON.stringify({ message: 'Registro eliminado' }));
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Se ha generado un error en el servidor' });
    } 

});

// Control de rutas inexistentes
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
    console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`);
});