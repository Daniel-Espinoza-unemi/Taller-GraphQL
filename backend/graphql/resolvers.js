const jwt = require('jsonwebtoken');
const { User, Game, DATABASE_MODE } = require('../models');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Obtener ID según BD
const getUserId = (user) => {
  return DATABASE_MODE === 'mongodb' ? user._id.toString() : user.id;
};

const getGameId = (game) => {
  return DATABASE_MODE === 'mongodb' ? game._id.toString() : game.id;
};

const resolvers = {
  // ==================== QUERIES ====================
  Query: {
    // Obtener usuario actual
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('No autenticado');
      }
      return user;
    },

    // Obtener todos los juegos del usuario
    games: async (_, __, { user }) => {
      if (!user) {
        throw new Error('No autenticado');
      }

      const usuarioId = getUserId(user);
      let games;

      if (DATABASE_MODE === 'postgres') {
        games = await Game.findAll({
          where: { usuarioId },
          order: [['createdAt', 'DESC']]
        });
      } else {
        games = await Game.find({ usuarioId }).sort({ createdAt: -1 });
      }

      return games;
    },

    // Obtener un juego por ID
    game: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('No autenticado');
      }

      const usuarioId = getUserId(user);
      let game;

      if (DATABASE_MODE === 'postgres') {
        game = await Game.findOne({
          where: { id, usuarioId }
        });
      } else {
        game = await Game.findOne({
          _id: id,
          usuarioId
        });
      }

      if (!game) {
        throw new Error('Juego no encontrado');
      }

      return game;
    }
  },

  // ==================== MUTATIONS ====================
  Mutation: {
    // Registrar usuario
    register: async (_, { input }) => {
      const { nombre, email, password } = input;

      // Validaciones
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Verificar si usuario existe
      let userExists;
      if (DATABASE_MODE === 'mongodb') {
        userExists = await User.findOne({ email });
      } else {
        userExists = await User.findOne({ where: { email } });
      }

      if (userExists) {
        throw new Error('El email ya está registrado');
      }

      // Crear usuario
      const user = await User.create({ nombre, email, password });
      const userId = getUserId(user);

      // Generar token
      const token = generateToken(userId);

      return {
        token,
        user: {
          id: userId,
          nombre: user.nombre,
          email: user.email
        }
      };
    },

    // Login
    login: async (_, { input }) => {
      const { email, password } = input;

      // Buscar usuario
      let user;
      if (DATABASE_MODE === 'mongodb') {
        user = await User.findOne({ email });
      } else {
        user = await User.findOne({ where: { email } });
      }

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Credenciales inválidas');
      }

      const userId = getUserId(user);
      const token = generateToken(userId);

      return {
        token,
        user: {
          id: userId,
          nombre: user.nombre,
          email: user.email
        }
      };
    },

    // Crear juego
    createGame: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('No autenticado');
      }

      const usuarioId = getUserId(user);
      const { nombre, peso, versiones, jugadores, valor } = input;

      const game = await Game.create({
        nombre,
        peso,
        versiones,
        jugadores,
        valor,
        usuarioId
      });

      return game;
    },

    // Actualizar juego
    updateGame: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new Error('No autenticado');
      }

      const usuarioId = getUserId(user);
      let game;

      if (DATABASE_MODE === 'postgres') {
        game = await Game.findOne({
          where: { id, usuarioId }
        });

        if (!game) {
          throw new Error('Juego no encontrado');
        }

        await game.update(input);
      } else {
        game = await Game.findOne({
          _id: id,
          usuarioId
        });

        if (!game) {
          throw new Error('Juego no encontrado');
        }

        Object.assign(game, input);
        await game.save();
      }

      return game;
    },

    // Eliminar juego
    deleteGame: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('No autenticado');
      }

      const usuarioId = getUserId(user);
      let game;

      if (DATABASE_MODE === 'postgres') {
        game = await Game.findOne({
          where: { id, usuarioId }
        });

        if (!game) {
          throw new Error('Juego no encontrado');
        }

        await game.destroy();
      } else {
        game = await Game.findOneAndDelete({
          _id: id,
          usuarioId
        });

        if (!game) {
          throw new Error('Juego no encontrado');
        }
      }

      return true;
    }
  },

  // ==================== RESOLVERS DE CAMPOS ====================
  User: {
    // Resolver para obtener juegos del usuario
    juegos: async (parent, _, { user }) => {
      const usuarioId = getUserId(parent);
      let games;

      if (DATABASE_MODE === 'postgres') {
        games = await Game.findAll({
          where: { usuarioId },
          order: [['createdAt', 'DESC']]
        });
      } else {
        games = await Game.find({ usuarioId }).sort({ createdAt: -1 });
      }

      return games;
    }
  }
};

module.exports = resolvers;