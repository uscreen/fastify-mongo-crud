import fastify from 'fastify'
import sensible from '@fastify/sensible'
import mongo from './plugins/mongo.js'
import accounts from './services/accounts.js'

// config
const opts = {
  mongoUri: 'mongodb://127.0.0.1:27017/crud-example-plain'
}

// init
const app = fastify({ logger: { level: 'debug' } })

// register modules and plugins 1st
app.register(sensible)
app.register(mongo, opts)

// register services
app.register(accounts)

// on ready
app.ready((err) => {
  if (err) throw err
  app.log.info('Application ready, routes are set:\n' + app.printRoutes())
})

app.listen(9000)
