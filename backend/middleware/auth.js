const jwt = require('jsonwebtoken');
const { User, DATABASE_MODE } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No hay token, autorización denegada' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario según la BD
    let user;
    if (DATABASE_MODE === 'mongodb') {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor' 
    });
  }
};

module.exports = authMiddleware;