const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/postgres');

const GamePostgres = sequelize.define('GamePostgres', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  peso: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  versiones: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  jugadores: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  usuarioId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  }
}, {
  tableName: 'juegos',
  timestamps: true
});

module.exports = GamePostgres;