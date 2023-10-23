import fp from 'fastify-plugin'
import mongodb from '@fastify/mongodb'
import crud from '../../../index.js' // @uscreen.de/fastify-mongo-crud

export default fp((fastify, opts, next) => {
  /**
   * 1) setup mongodb connection
   */
  fastify.register(mongodb, { url: opts.mongoUri })

  /**
   * 2) setup CRUD factory
   */
  fastify.register(crud)

  /**
   * 3) proceed
   */
  next()
})
