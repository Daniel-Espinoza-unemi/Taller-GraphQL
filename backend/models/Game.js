const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  peso: {
    type: Number,
    required: [true, 'El peso es requerido'],
    min: [0, 'El peso debe ser positivo']
  },
  versiones: {
    type: String,
    required: [true, 'Las versiones son requeridas'],
    trim: true
  },
  jugadores: {
    type: String,
    required: [true, 'El número de jugadores es requerido'],
    trim: true
  },
  valor: {
    type: Number,
    required: [true, 'El valor es requerido'],
    min: [0, 'El valor debe ser positivo']
  },
  usuarioId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'juegos'
});

// Índice para búsquedas por usuario
gameSchema.index({ usuarioId: 1, createdAt: -1 });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;