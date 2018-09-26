const { ApolloServer, gql } = require('apollo-server-express')
const express = require('express')
const next = require('next')
const database = require('./server/db')
const apiRoutes = require('./server/routes')
const { typeDefs, resolvers } = require('./server/schema')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const nextHandle = app.getRequestHandler()

const apollo = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
})

app
  .prepare()
  .then(database)
  .then(db => {
    const server = express()
    server.use('/api', apiRoutes)
    apollo.applyMiddleware({ app: server }) // app is from an existing express app

    server.get('*', nextHandle)

    server.listen(port, err => {
      if (err) throw err
      console.log(
        `🚀 Server ready at http://localhost:${port}${apollo.graphqlPath}`,
      )
    })
  })
