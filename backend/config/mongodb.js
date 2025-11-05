const mongoose = require('mongoose');
require('dotenv').config();

// Función para conectar a MongoDB
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando MongoDB:', error.message);
    throw error;
  }
};

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error en conexión Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📴 Mongoose desconectado');
});

module.exports = connectMongoDB;