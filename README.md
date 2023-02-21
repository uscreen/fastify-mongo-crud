# fastify-mongo-crud

[![Test CI](https://github.com/uscreen/fastify-mongo-crud/actions/workflows/main.yml/badge.svg)](https://github.com/uscreen/fastify-mongo-crud/actions/workflows/node.js.yml)
[![Test Coverage](https://coveralls.io/repos/github/uscreen/fastify-mongo-crud/badge.svg?branch=master)](https://coveralls.io/github/uscreen/fastify-mongo-crud?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/uscreen/fastify-mongo-crud/badge.svg?targetFile=package.json)](https://snyk.io/test/github/uscreen/fastify-mongo-crud?targetFile=package.json)
[![NPM Version](https://badge.fury.io/js/@uscreen.de%2Ffastify-mongo-crud.svg)](https://badge.fury.io/js/@uscreen.de%2Ffastify-mongo-crud)

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
   * 3) proceed
   */
  next()
})

```

Usage within a `services/accounts.js` file:

```js
'use strict'
/**
 * let's write a classic CRUD service
 */
module.exports = (fastify, opts, next) => {
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
```

## Options

## Api

---

## Roadmap

- embed and configure fastify-mongodb and expose `fastify.mongo` from within this module, if not installed in parent

## Changelog

### v0.3.0

- upgraded to fastify 3.x

### v0.2.0

- added implicit timestamps for record "created" & "modified"

### v0.1.0

- added tests

### v0.0.0

- init

---

## License

Licensed under [MIT](./LICENSE).

Published, Supported and Sponsored by [u|screen](https://uscreen.de)
