# fastify-mongo-crud

> Tiny mongodb decorator providing CRUD-style DB-methods

## Install

```sh
$ yarn add @uscreen.de/fastify-mongo-crud
```

## Example

Setup within a `plugins/mongo.js` file:

```js
'use strict'

const fp = require('fastify-plugin')
const mongodb = require('fastify-mongodb')
const crud = require('@uscreen.de/fastify-mongo-crud')

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
   * 3) proceed after connection
   */
  fastify.ready(() => {
    next()
  })
})

```

Usage within a `services/accounts.js` file:

```js
'use strict'

/**
 * let's write a classic CRUD service
 */
module.exports = async fastify => {
  const accounts = fastify.crud('accounts')

  /**
   * create
   */
  fastify.put('/inquiries', async req => {
    return { account: await accounts.create(req.body) }
  })

  /**
   * read
   */
  fastify.get('/accounts/:id', async req => {
    return { account: await accounts.read(req.params.id) }
  })

  /**
   * update
   */
  fastify.put('/accounts/:id', async req => {
    return { account: await accounts.update(req.params.id, req.body) }
  })

  /**
   * delete
   */
  fastify.delete('/accounts/:id', async req => {
    return { account: await accounts.delete(req.params.id) }
  })

  /**
   * list
   */
  fastify.get('/accounts', async () => {
    return { accounts: await accounts.list() }
  })
}

```

## Options

## Api

---

## Roadmap

> TBD

## Changelog

### v0.0.0

- init

---

## License

Licensed under [MIT](./LICENSE).

Published, Supported and Sponsored by [u|screen](https://uscreen.de)
