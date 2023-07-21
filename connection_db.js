const { MongoClient } = require('mongodb');
const path = require('path');

// traer variables de entorno para conexion a DB
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new MongoClient(process.env.DATABASE_URL);

async function connect() {
    let connection = null;
    console.log('Conectando...');

    try {
        connection = await client.connect();
        console.log('🔌 Conectado');
    } catch (error) {
        console.log(error.message);
    }

    return connection;
}

async function disconect() {
    try {
        await client.connect();
        console.log('🔌 Desconectado');
    } catch (error) {
        console.log(error.message);
    }
}

async function connectToCollection(collectionName) {
    const connection = await connect();
    const db = connection.db(process.env.DATABASE_NAME);
    const collection = db.collection(collectionName);

    return collection;
}

module.exports = { connectToCollection, disconect };