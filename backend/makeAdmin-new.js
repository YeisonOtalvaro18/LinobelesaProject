require('dotenv').config();
const mongoose = require('mongoose');
const { initializeAdminSystem } = require('./setup/initializeAdmin');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/linobelesa';
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    return false;
  }
};

const main = async () => {
  console.log('🚀 Iniciando configuración de administradores...');
  
  const connected = await connectDB();
  if (!connected) {
    console.log('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  await initializeAdminSystem();
  
  console.log('✨ Configuración completada');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Error en el proceso:', error);
  process.exit(1);
});