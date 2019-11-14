'use strict'

const fp = require('fastify-plugin')
const mongodb = require('fastify-mongodb')
const crud = require('../../../index') // @uscreen.de/fastify-mongo-crud

module.exports = fp((fastify, opts, next) => {
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
