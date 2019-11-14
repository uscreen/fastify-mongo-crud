'use strict'

const fastify = require('fastify')

// config
const opts = {
  mongoUri: 'mongodb://127.0.0.1:27017/crud-example-plain'
}

// init
const app = fastify({ logger: { level: 'debug', prettyPrint: true } })

// register modules and plugins 1st
app.register(require('fastify-sensible'))
app.register(require('./plugins/mongo'), opts)

// register services
app.register(require('./services/accounts'))

// on ready
app.ready(err => {
  if (err) throw err
  app.log.info('Application ready, routes are set:\n' + app.printRoutes())
})

app.listen(9000)
