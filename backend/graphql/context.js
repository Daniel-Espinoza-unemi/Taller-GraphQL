const jwt = require('jsonwebtoken');
const { User, DATABASE_MODE } = require('../models');

// Función para obtener usuario del token
const getUser = async (token) => {
  if (!token) return null;

  try {
    // Quitar "Bearer " si existe
    const cleanToken = token.replace('Bearer ', '');
    
    // Verificar token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Buscar usuario
    let user;
    if (DATABASE_MODE === 'mongodb') {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    }

    return user;
  } catch (error) {
    console.error('Error en autenticación GraphQL:', error.message);
    return null;
  }
};

// Context: Se ejecuta en cada petición
const context = async ({ req }) => {
  // Obtener token del header
  const token = req.headers.authorization || '';
  
  // Obtener usuario
  const user = await getUser(token);

  return { user, DATABASE_MODE };
};

module.exports = context;