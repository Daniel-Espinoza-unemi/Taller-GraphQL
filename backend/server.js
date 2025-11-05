const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
require('dotenv').config();

// Importar conexiones
const { connectPostgres } = require('./config/postgres');
const connectMongoDB = require('./config/mongodb');

// Importar rutas REST
const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');

// Importar GraphQL
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const context = require('./graphql/context');

const app = express();

// Middlewares
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://studio.apollographql.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas REST (mantener compatibilidad)
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  const DATABASE_MODE = process.env.DATABASE_MODE || 'both';
  
  res.json({ 
    message: '🎮 API de Gestión de Juegos PS5',
    version: '1.0.0',
    databaseMode: DATABASE_MODE,
    endpoints: {
      rest: {
        auth: '/api/auth',
        games: '/api/games'
      },
      graphql: '/graphql'
    }
  });
});

// Configurar Apollo Server
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const DATABASE_MODE = process.env.DATABASE_MODE || 'both';

    console.log('\n🚀 INICIANDO SERVIDOR PS5 GAMES MANAGER\n');
    console.log('='.repeat(50));
    console.log(`\n📊 Modo de Base de Datos: ${DATABASE_MODE.toUpperCase()}\n`);

    // Conectar bases de datos
    if (DATABASE_MODE === 'postgres') {
      await connectPostgres();
      console.log('📋 PostgreSQL para usuarios Y juegos');
    } else if (DATABASE_MODE === 'mongodb') {
      await connectMongoDB();
      console.log('📋 MongoDB para usuarios Y juegos');
    } else {
      await connectPostgres();
      await connectMongoDB();
      console.log('📋 PostgreSQL (usuarios) + MongoDB (juegos)');
    }

    // Crear servidor Apollo GraphQL
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context,
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      }
    });

    // Iniciar Apollo Server
    await apolloServer.start();

    // Aplicar middleware de Apollo
    apolloServer.applyMiddleware({ 
      app,
      path: '/graphql'
    });

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`\n✅ Servidor corriendo exitosamente`);
      console.log(`\n📍 REST API: http://localhost:${PORT}`);
      console.log(`📍 GraphQL: http://localhost:${PORT}${apolloServer.graphqlPath}`);
      console.log(`🌐 Frontend: ${process.env.CLIENT_URL}`);
      console.log(`\n💡 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`\n${'='.repeat(50)}\n`);
    });
  } catch (error) {
    console.error('\n❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();