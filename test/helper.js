import Fastify from 'fastify'
import mongodb from '@fastify/mongodb'
import sensible from '@fastify/sensible'
import { ulid } from 'ulid'
import crud from '../index.js'

const uuid = (prefix = '') => {
  return [prefix, ulid().toLowerCase()].filter((e) => e).join('-')
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const database = uuid('npm-crud-test')
const mongoServer = process.env.mongoServer || '127.0.0.1:27017'
const mongoUri = `mongodb://${mongoServer}/${database}`

export const build = async (t) => {
  const fastify = Fastify()

  fastify.register(sensible)
  fastify.register(mongodb, {
    forceClose: true,
    url: mongoUri
  })
  fastify.register(crud)
  t.after(async () => {
    await wait(500)
    await fastify.mongo.db.dropDatabase()
    await fastify.close()
  })

  await fastify.ready()
  return fastify
}
