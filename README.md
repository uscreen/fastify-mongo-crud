# fastify-mongo-crud

> Tiny mongodb decorator providing CRUD-style DB-methods

## Install

```sh
$ yarn add @uscreen.de/fastify-mongo-crud
```

Adding `@uscreen.de/fastify-mongo-crud` also adds `fastify-mongodb` as direct dependency.

> __Note__: You still need to register `mongodb` prior to `crud` as seen in example below. This is due to encapsulation of fastify plugins assuming you will want to resuse same `fastify.mongo` accross your application.

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
  fastify.put('/accounts', async req => {
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

- embed and configure fastify-mongodb and expose `fastify.mongo` from within this module. Avoid duplicate install of plugins, though.

## Changelog

### v0.1.0

- tests

### v0.0.0

- init

---

## License

Licensed under [MIT](./LICENSE).

Published, Supported and Sponsored by [u|screen](https://uscreen.de)
