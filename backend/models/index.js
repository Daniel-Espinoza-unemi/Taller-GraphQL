require('dotenv').config();

const DATABASE_MODE = process.env.DATABASE_MODE || 'both';

console.log(`\n📊 Modo de base de datos: ${DATABASE_MODE.toUpperCase()}`);

let User, Game;

// Seleccionar modelos según el modo configurado en .env
switch (DATABASE_MODE) {
  case 'postgres':
    // TODO en PostgreSQL
    console.log('   ✅ Usuarios: PostgreSQL');
    console.log('   ✅ Juegos: PostgreSQL');
    User = require('./User');
    Game = require('./GamePostgres');
    break;
    
  case 'mongodb':
    // TODO en MongoDB
    console.log('   ✅ Usuarios: MongoDB');
    console.log('   ✅ Juegos: MongoDB');
    User = require('./UserMongo');
    Game = require('./Game');
    break;
    
  case 'both':
  default:
    // PostgreSQL para usuarios, MongoDB para juegos
    console.log('   ✅ Usuarios: PostgreSQL');
    console.log('   ✅ Juegos: MongoDB');
    User = require('./User');
    Game = require('./Game');
    break;
}

module.exports = {
  User,
  Game,
  DATABASE_MODE
};