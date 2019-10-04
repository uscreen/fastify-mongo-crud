'use strict'

const Fastify = require('fastify')
const mongodb = require('fastify-mongodb')
const sensible = require('fastify-sensible')
const crud = require('../index')

const database = process.env.TAP_CHILD_ID
  ? `npm-crud-test-${process.env.TAP_CHILD_ID}`
  : 'npm-crud-test'

const mongoServer = process.env.mongoServer || '127.0.0.1:27017'
const mongoUri = `mongodb://${mongoServer}/${database}`

const build = async t => {
  const fastify = Fastify()

  fastify.register(sensible)
  fastify.register(mongodb, {
    forceClose: true,
    useUnifiedTopology: true,
    url: mongoUri
  })
  fastify.register(crud)
  t.tearDown(fastify.close.bind(fastify))

  await fastify.ready()
  await fastify.mongo.db.dropDatabase()

  return fastify
}

module.exports = {
  build
}
