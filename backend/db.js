require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Conexión exitosa a MongoDB Atlas');
    const db = client.db('DataLinobelesa');
    return db;
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    return null;
  }
}

module.exports = connectDB;
