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

      get newId() {
        return new ObjectId()
      },

      async create(data) {
        const result = await collection.insertOne(data)
        return result.ops.shift()
      },

      read(id) {
        return this.findOne({ _id: ObjectId(id) })
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
        if (result) return result
        throw fastify.httpErrors.notFound()
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
