'use strict'

const fp = require('fastify-plugin')

/**
 * @todo:
 * - add custom error
 * - add event emitter :)
 */

const fastifyMongoCrud = (fastify, opts, next) => {
  const crud = collectionName => {
    const collection = fastify.mongo.db.collection(collectionName)
    const ObjectId = fastify.mongo.ObjectId

    return {
      get collection() {
        return collection
      },

      async create(data) {
        const result = await collection.insertOne(data)
        return result.ops.shift()
      },

      async read(id) {
        const result = await collection.find({ _id: ObjectId(id) }).toArray()
        if (result.length) return result.shift()
        throw fastify.httpErrors.notFound()
      },

      async update(id, data) {
        const result = await collection.findOneAndUpdate(
          { _id: ObjectId(id) },
          { $set: data },
          { returnOriginal: false, upsert: true }
        )
        return result.value
      },

      async delete(id) {
        const result = await collection.findOneAndDelete({
          _id: ObjectId(id)
        })
        if (result.value) return result.value
        throw fastify.httpErrors.notFound()
      },

      async list(query = {}) {
        const result = await collection.find(query).toArray()
        return result
      },

      async findOne(query) {
        const result = await collection.findOne(query)
        return result
      }
    }
  }

  fastify.decorate(opts.decoratesAs || 'crud', crud)
  next()
}

module.exports = fp(fastifyMongoCrud, {
  fastify: '>=2.x',
  name: 'fastify-mongo-crud',
  decorators: {
    fastify: ['httpErrors', 'mongo']
  },
  dependencies: ['fastify-sensible', 'fastify-mongodb']
})
