import { test } from 'node:test'
import assert from 'node:assert/strict'

import { build } from './helper.js'

test('fastify-mongo-crud', async (t) => {
  const fastify = await build(t)
  const accounts = fastify.crud('accounts')
  let _id

  t.test('should have decorated with default "fastify.crud()"', (_t) => {
    assert.ok(fastify.crud)
  })

  await t.test('crud()', async (t) => {
    await t.test('should return collection via getter', async (_t) => {
      assert.ok(accounts.collection)
      const r = await accounts.collection.insertOne({ a: 1 })
      assert.ok(r.acknowledged)
      assert.ok(r.insertedId)
    })
  })

  await t.test('create()', async (t) => {
    await t.test('should create new record and return it', async (_t) => {
      const created = await accounts.create({ b: 2 })
      assert.equal(2, created.b)
      _id = created._id
      const dbValue = await accounts.collection.findOne({ _id: created._id })
      assert.equal(2, dbValue.b)
    })
  })

  await t.test('read()', async (t) => {
    await t.test('should read a record by _id', async (_t) => {
      const read = await accounts.read(_id)
      assert.equal(2, read.b)
    })

    await t.test('should throw 404 on unknown _id', async (_t) => {
      let thrown = false
      try {
        await accounts.read(accounts.newId)
      } catch (error) {
        thrown = true
        assert.equal(error.name, 'NotFoundError')
        assert.equal(error.message, 'Not Found')
        assert.equal(error.statusCode, Number(404))
      }
      assert.ok(thrown)
    })
  })

  await t.test('update()', async (t) => {
    await t.test(
      'should update a record by _id and return new value',
      async (_t) => {
        const read = await accounts.update(_id, { b: 3 })
        assert.equal(3, read.b)
      }
    )

    await t.test(
      'should patch a record by _id and return new value',
      async (_t) => {
        const read = await accounts.update(_id, { c: 1 })
        assert.equal(3, read.b)
        assert.equal(1, read.c)
      }
    )

    await t.test(
      'should upsert a record with unknown _id and return new value',
      async (t) => {
        const newId = accounts.newId
        const read = await accounts.update(newId, { d: 1 })
        assert.equal(newId.toString(), read._id.toString())
        assert.equal(1, read.d)
      }
    )
  })

  await t.test('delete()', async (t) => {
    await t.test(
      'should delete a record by _id and return old value',
      async (_t) => {
        const read = await accounts.delete(_id)
        assert.equal(3, read.b)
        assert.equal(1, read.c)
      }
    )

    await t.test('should throw 404 on deleting an unknown _id', async (_t) => {
      let thrown = false
      try {
        await accounts.delete(_id)
      } catch (error) {
        thrown = true
        assert.equal(error.name, 'NotFoundError')
        assert.equal(error.message, 'Not Found')
        assert.equal(error.statusCode, Number(404))
      }
      assert.ok(thrown)
    })
  })

  await t.test('list()', async (t) => {
    await t.test('should list all records', async (_t) => {
      const list = await accounts.list()
      assert.equal(2, list.length)
    })

    await t.test('should list filtered records', async (_t) => {
      const list = await accounts.list({ a: 1 })
      assert.equal(1, list.length)
      assert.equal(1, list[0].a)
    })

    await t.test('should return empty list when nothing found', async (_t) => {
      const list = await accounts.list({ a: 100 })
      assert.equal(0, list.length)
    })
  })

  await t.test('findOne()', async (t) => {
    await t.test('should findOne filtered record', async (_t) => {
      const record = await accounts.findOne({ a: 1 })
      assert.equal(1, record.a)
    })

    await t.test('findOne throws 404 on empty result', async (_t) => {
      let thrown = false
      try {
        await accounts.findOne({ a: 100 })
      } catch (error) {
        thrown = true
        assert.equal(error.name, 'NotFoundError')
        assert.equal(error.message, 'Not Found')
        assert.equal(error.statusCode, Number(404))
      }
      assert.ok(thrown)
    })
  })
})
