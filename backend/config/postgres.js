const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de conexión a PostgreSQL
const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado correctamente');
    await sequelize.sync({ alter: false });
    console.log('✅ Tablas sincronizadas');
  } catch (error) {
    console.error('❌ Error conectando PostgreSQL:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectPostgres };