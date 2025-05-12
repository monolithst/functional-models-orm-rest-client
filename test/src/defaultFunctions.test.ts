import { BaseModel } from 'functional-models'
import {
  defaultInstance,
  standardHeaderGetter,
  standardUrlBuilder,
  standardHttpMethodGetter,
} from '../../src/defaultFunctions'
import { HttpMethod, DatastoreMethod } from '../../src/types'
import { assert } from 'chai'

const TestModel = BaseModel('TestModel', { properties: {} })

describe('/src/defaultFunctions.ts', () => {
  describe('#standardHeaderGetter()', () => {
    it('should provide Content-type:application/json', async () => {
      //@ts-ignore
      const actual = (await standardHeaderGetter()())['Content-Type']
      const expected = 'application/json'
      assert.equal(actual, expected)
    })
  })
  describe('#standardUrlBuilder()', () => {
    describe('#buildModelUrl()', () => {
      it('should produce a url of /api/test-model for TestModel', () => {
        const actual = standardUrlBuilder().buildModelUrl(
          DatastoreMethod.search,
          TestModel
        )
        const expected = '/api/test-model'
        assert.equal(actual, expected)
      })
      it('should produce a url of /api/test-model/insert for TestModel and bulkInsert', () => {
        const actual = standardUrlBuilder().buildModelUrl(
          DatastoreMethod.bulkInsert,
          TestModel
        )
        const expected = '/api/test-model/insert'
        assert.equal(actual, expected)
      })
    })
    describe('#buildModelInstanceUrl()', () => {
      it('should produce a url of /api/test-model/123 for TestModel and 123', () => {
        const actual = standardUrlBuilder().buildModelInstanceUrl(
          DatastoreMethod.retrieve,
          TestModel,
          123
        )
        const expected = '/api/test-model/123'
        assert.equal(actual, expected)
      })
    })
  })
  describe('#standardHttpMethodGetter()', () => {
    it('should return put for save', async () => {
      const actual = standardHttpMethodGetter()(DatastoreMethod.save)
      const expected = HttpMethod.put
      assert.equal(actual, expected)
    })
    it('should return get for retrieve', async () => {
      const actual = standardHttpMethodGetter()(DatastoreMethod.retrieve)
      const expected = HttpMethod.get
      assert.equal(actual, expected)
    })
    it('should return delete for delete', async () => {
      const actual = standardHttpMethodGetter()(DatastoreMethod.delete)
      const expected = HttpMethod.delete
      assert.equal(actual, expected)
    })
    it('should return bulkInsert for bulkInsert', async () => {
      const actual = standardHttpMethodGetter()(DatastoreMethod.bulkInsert)
      const expected = HttpMethod.post
      assert.equal(actual, expected)
    })
    it('should return post for search', async () => {
      const actual = standardHttpMethodGetter()(DatastoreMethod.search)
      const expected = HttpMethod.post
      assert.equal(actual, expected)
    })
    it('should throw an exception if any old string is passed in', async () => {
      try {
        // @ts-ignore
        const actual = standardHttpMethodGetter()('not-search')
        assert.fail('No exception thrown')
      } catch {}
    })
  })
  describe('#defaultInstance()', () => {
    it('should choose the value of 10 if provided, instead of default 11', async () => {
      const input = 10
      const actual = defaultInstance(input, () => 11)
      const expected = 10
      assert.equal(actual, expected)
    })
    it('should choose the value of 11 for the default, if null is provided', async () => {
      const input = null
      const actual = defaultInstance(input, () => 11)
      const expected = 11
      assert.equal(actual, expected)
    })
    it('should choose the value of 11 for the default, if undefined is provided', async () => {
      const input = undefined
      const actual = defaultInstance(input, () => 11)
      const expected = 11
      assert.equal(actual, expected)
    })
  })
})
