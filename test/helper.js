import Fastify from 'fastify'
import mongodb from 'fastify-mongodb'
import sensible from 'fastify-sensible'
import crud from '../index.js'

const database = process.env.TAP_CHILD_ID
  ? `npm-crud-test-${process.env.TAP_CHILD_ID}`
  : 'npm-crud-test'

const mongoServer = process.env.mongoServer || '127.0.0.1:27017'
const mongoUri = `mongodb://${mongoServer}/${database}`

export const build = async (t) => {
  const fastify = Fastify()

  fastify.register(sensible)
  fastify.register(mongodb, {
    forceClose: true,
    useUnifiedTopology: true,
    url: mongoUri
  })
  fastify.register(crud)
  t.teardown(fastify.close.bind(fastify))

  await fastify.ready()
  await fastify.mongo.db.dropDatabase()

  return fastify
}
