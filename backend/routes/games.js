const express = require('express');
const router = express.Router();
const { Game, DATABASE_MODE } = require('../models');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener ID del usuario según la BD
const getUserId = (user) => {
  return DATABASE_MODE === 'mongodb' ? user._id.toString() : user.id;
};

// @route   GET /api/games
// @desc    Obtener todos los juegos del usuario
// @access  Private
router.get('/', async (req, res) => {
  try {
    const usuarioId = getUserId(req.user);
    let games;

    if (DATABASE_MODE === 'postgres') {
      // PostgreSQL con Sequelize
      games = await Game.findAll({
        where: { usuarioId },
        order: [['createdAt', 'DESC']]
      });
    } else {
      // MongoDB con Mongoose
      games = await Game.find({ usuarioId }).sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los juegos',
      error: error.message
    });
  }
});

// @route   GET /api/games/:id
// @desc    Obtener un juego por ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const usuarioId = getUserId(req.user);
    let game;

    if (DATABASE_MODE === 'postgres') {
      game = await Game.findOne({
        where: {
          id: req.params.id,
          usuarioId
        }
      });
    } else {
      game = await Game.findOne({
        _id: req.params.id,
        usuarioId
      });
    }

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
    }

    res.json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error al obtener juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el juego',
      error: error.message
    });
  }
});

// @route   POST /api/games
// @desc    Crear nuevo juego
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { nombre, peso, versiones, jugadores, valor } = req.body;

    // Validaciones
    if (!nombre || !peso || !versiones || !jugadores || !valor) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    const usuarioId = getUserId(req.user);

    // Crear juego
    const game = await Game.create({
      nombre,
      peso,
      versiones,
      jugadores,
      valor,
      usuarioId
    });

    res.status(201).json({
      success: true,
      message: 'Juego creado exitosamente',
      data: game
    });
  } catch (error) {
    console.error('Error al crear juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el juego',
      error: error.message
    });
  }
});

// @route   PUT /api/games/:id
// @desc    Actualizar juego
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { nombre, peso, versiones, jugadores, valor } = req.body;
    const usuarioId = getUserId(req.user);
    let game;

    if (DATABASE_MODE === 'postgres') {
      // PostgreSQL
      game = await Game.findOne({
        where: {
          id: req.params.id,
          usuarioId
        }
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado'
        });
      }

      // Actualizar
      await game.update({
        nombre: nombre || game.nombre,
        peso: peso || game.peso,
        versiones: versiones || game.versiones,
        jugadores: jugadores || game.jugadores,
        valor: valor || game.valor
      });
    } else {
      // MongoDB
      game = await Game.findOne({
        _id: req.params.id,
        usuarioId
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado'
        });
      }

      // Actualizar
      game.nombre = nombre || game.nombre;
      game.peso = peso || game.peso;
      game.versiones = versiones || game.versiones;
      game.jugadores = jugadores || game.jugadores;
      game.valor = valor || game.valor;

      await game.save();
    }

    res.json({
      success: true,
      message: 'Juego actualizado exitosamente',
      data: game
    });
  } catch (error) {
    console.error('Error al actualizar juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el juego',
      error: error.message
    });
  }
});

// @route   DELETE /api/games/:id
// @desc    Eliminar juego
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const usuarioId = getUserId(req.user);
    let game;

    if (DATABASE_MODE === 'postgres') {
      game = await Game.findOne({
        where: {
          id: req.params.id,
          usuarioId
        }
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado'
        });
      }

      await game.destroy();
    } else {
      game = await Game.findOneAndDelete({
        _id: req.params.id,
        usuarioId
      });

      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Juego no encontrado'
        });
      }
    }

    res.json({
      success: true,
      message: 'Juego eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar juego:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el juego',
      error: error.message
    });
  }
});

module.exports = router;