const tap = require('tap')
const { build } = require('./helper')

tap.test('fastify-mongo-crud', async t => {
  const fastify = await build(t)
  const accounts = fastify.crud('accounts')
  let _id

  t.test('should have decorated with default "fastify.crud"', t => {
    t.ok(fastify.crud)
    t.end()
  })

  t.test('should return collection via getter', t => {
    t.ok(accounts.collection)
    accounts.collection.insertOne({ a: 1 }, (err, r) => {
      t.error(err)
      t.equal(1, r.insertedCount)
      t.end()
    })
  })

  t.test('should create new record and return it', async t => {
    const created = await accounts.create({ b: 2 })
    t.equal(2, created.b)
    _id = created._id
    const dbValue = await accounts.collection.findOne({ _id: created._id })
    t.equal(2, dbValue.b)
    t.end()
  })

  t.test('should read a record by _id', async t => {
    const read = await accounts.read(_id)
    t.equal(2, read.b)
    t.end()
  })

  t.test('should throw 404 on unknown _id', async t => {
    let thrown = false
    try {
      await accounts.read(accounts.newId)
    } catch (error) {
      thrown = true
      t.is(error.name, 'NotFoundError')
      t.is(error.message, 'Not Found')
      t.is(error.statusCode, Number(404))
    }
    t.is(true, thrown)
    t.end()
  })

  t.test('should update a record by _id and return new value', async t => {
    const read = await accounts.update(_id, { b: 3 })
    t.equal(3, read.b)
    t.end()
  })

  t.test('should patch a record by _id and return new value', async t => {
    const read = await accounts.update(_id, { c: 1 })
    t.equal(3, read.b)
    t.equal(1, read.c)
    t.end()
  })

  t.test('should upsert a record by _id and return new value', async t => {
    const newId = accounts.newId
    const read = await accounts.update(newId, { d: 1 })
    t.equal(newId.toString(), read._id.toString())
    t.equal(1, read.d)
    t.end()
  })

  t.end()
})
