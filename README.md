--"Instalar dependencias" backend/frontend, nom install, iniciar servidor: npm run dev
--"Instalar dependecias GraphQL" npm install apollo-server-express graphql
--Para que salga el token se debe ejecutar esto y poner las credenciales de la cuenta que esta registrada: 
mutation {
  login(input: {
    email: "tu_email@email.com"
    password: "tu_contraseña"
  }) {
    token
    user {
      nombre
      email
    }
  }
}
--Despues de ejecutar eso, va a salir el token, vamos a headers y en hearder key escribimos: Authorization y en values: Bearer (TOKEN) sin comillas, sin nada
--Para ver los juegos que están guardados:
query {
  games {
    nombre
    peso
    valor
  }
}
