const { gql } = require('apollo-server-express');

// Definir la estructura de datos (Schema)
const typeDefs = gql`
  # Tipo Usuario
  type User {
    id: ID!
    nombre: String!
    email: String!
    juegos: [Game!]!
  }

  # Tipo Juego
  type Game {
    id: ID!
    nombre: String!
    peso: Float!
    versiones: String!
    jugadores: String!
    valor: Float!
    usuarioId: String!
    createdAt: String!
    updatedAt: String!
  }

  # Respuesta de autenticación
  type AuthPayload {
    token: String!
    user: User!
  }

  # Inputs para crear/actualizar
  input RegisterInput {
    nombre: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateGameInput {
    nombre: String!
    peso: Float!
    versiones: String!
    jugadores: String!
    valor: Float!
  }

  input UpdateGameInput {
    nombre: String
    peso: Float
    versiones: String
    jugadores: String
    valor: Float
  }

  # QUERIES (Leer datos)
  type Query {
    # Obtener usuario actual
    me: User

    # Obtener todos los juegos del usuario
    games: [Game!]!

    # Obtener un juego por ID
    game(id: ID!): Game
  }

  # MUTATIONS (Crear, actualizar, eliminar)
  type Mutation {
    # Autenticación
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Juegos
    createGame(input: CreateGameInput!): Game!
    updateGame(id: ID!, input: UpdateGameInput!): Game!
    deleteGame(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;