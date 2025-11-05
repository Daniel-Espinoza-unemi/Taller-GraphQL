const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, DATABASE_MODE } = require('../models');
const authMiddleware = require('../middleware/auth');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el usuario ya existe (dependiendo de la BD)
    let userExists;
    if (DATABASE_MODE === 'mongodb') {
      userExists = await User.findOne({ email });
    } else {
      userExists = await User.findOne({ where: { email } });
    }

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const user = await User.create({ nombre, email, password });

    // Obtener ID según la BD
    const userId = DATABASE_MODE === 'mongodb' ? user._id.toString() : user.id;

    // Generar token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: userId,
          nombre: user.nombre,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login usuario
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa email y contraseña'
      });
    }

    // Buscar usuario según la BD
    let user;
    if (DATABASE_MODE === 'mongodb') {
      user = await User.findOne({ email });
    } else {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Obtener ID según la BD
    const userId = DATABASE_MODE === 'mongodb' ? user._id.toString() : user.id;

    // Generar token
    const token = generateToken(userId);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: userId,
          nombre: user.nombre,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obtener usuario actual
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  const userId = DATABASE_MODE === 'mongodb' ? req.user._id.toString() : req.user.id;
  
  res.json({
    success: true,
    data: {
      user: {
        id: userId,
        nombre: req.user.nombre,
        email: req.user.email
      }
    }
  });
});

module.exports = router;