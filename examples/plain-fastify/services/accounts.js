/**
 * let's write a classic CRUD service
 */
export default (fastify, opts, next) => {
  const accounts = fastify.crud('accounts')

  /**
   * plug in some appropiate authentication
   * middleware - of course!
   *
   * plus: add schemas to routes.
   */

  /**
   * create
   */
  fastify.post('/accounts', async (req) => {
    return { account: await accounts.create(req.body) }
  })

  /**
   * read
   */
  fastify.get('/accounts/:id', async (req) => {
    return { account: await accounts.read(req.params.id) }
  })

  /**
   * update
   */
  fastify.put('/accounts/:id', async (req) => {
    return { account: await accounts.update(req.params.id, req.body) }
  })

  /**
   * delete
   */
  fastify.delete('/accounts/:id', async (req) => {
    return { account: await accounts.delete(req.params.id) }
  })

  /**
   * list
   */
  fastify.get('/accounts', async () => {
    return { accounts: await accounts.list() }
  })

  next()
}
