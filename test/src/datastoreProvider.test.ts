import { BaseModel, TextProperty } from 'functional-models'
import { FunctionalModel, Model } from 'functional-models/interfaces'
import { OrmModel } from 'functional-models-orm/interfaces'
import datastoreProvider from '../../src/datastoreProvider'
import { assert } from 'chai'
import sinon from 'sinon'

const mockUrlBuilder = () => {
  return {
    buildModelUrl: sinon.stub(),
    buildModelInstanceUrl: sinon.stub(),
  }
}

const mockHttpProvider = (resolves={}) => {
  const stub = sinon.stub()
  stub.resolves(resolves)
  return stub
}

const _createOrmModel = <T extends FunctionalModel>(model: Model<T>) : OrmModel<T> => {
  return model as OrmModel<T>
}


type TestModelType = { name: string }
const TestModel = BaseModel<TestModelType>('TestModel', {
  properties: {
    name: TextProperty()
  }
})

describe('/src/datastoreProvider.ts', () => {
  describe('#()', () => {
    it('should not throw an exception if no arguments are passed', () => {
      const instance = datastoreProvider()
    })
    describe('#save()', () => {
      it('should use the httpProvider passed in', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const instance = datastoreProvider({
          httpProvider,
        })
        const modelInstance = TestModel.create({ name: 'My Name'})
        await instance.save<TestModelType, Model<TestModelType>>(modelInstance)
        assert.isTrue(httpProvider.called)
      })
      it('should use the urlBuilder passed in to call buildModelInstanceUrl', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const urlBuilder = mockUrlBuilder()
        const instance = datastoreProvider({
          httpProvider,
          urlBuilder,
        })
        const modelInstance = TestModel.create({ name: 'My Name'})
        await instance.save<TestModelType, Model<TestModelType>>(modelInstance)
        assert.isTrue(urlBuilder.buildModelInstanceUrl.called)
      })
    })
    describe('#retrieve()', () => {
      it('should use the httpProvider passed in', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const instance = datastoreProvider({
          httpProvider,
        })
        await instance.retrieve(TestModel as OrmModel<TestModelType>, 123)
        assert.isTrue(httpProvider.called)
      })
      it('should use the urlBuilder passed in to call buildModelInstanceUrl', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const urlBuilder = mockUrlBuilder()
        const instance = datastoreProvider({
          httpProvider,
          urlBuilder,
        })
        await instance.retrieve(TestModel as OrmModel<TestModelType>, 123)
        assert.isTrue(urlBuilder.buildModelInstanceUrl.called)
      })
    })
    describe('#delete()', () => {
      it('should use the httpProvider passed in', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const instance = datastoreProvider({
          httpProvider,
        })
        const modelInstance = TestModel.create({ name: 'My Name'})
        await instance.delete<TestModelType, Model<TestModelType>>(modelInstance)
        assert.isTrue(httpProvider.called)
      })
    })
    describe('#bulkInsert()', () => {
      it('should use the httpProvider passed in', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const instance = datastoreProvider({
          httpProvider,
        })
        const modelInstance = TestModel.create({ name: 'My Name'})
        // @ts-ignore
        await instance.bulkInsert<TestModelType, Model<TestModelType>>(TestModel, [modelInstance])
        assert.isTrue(httpProvider.called)
      })
      it('should use the urlBuilder passed in to call buildModelUrl', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const urlBuilder = mockUrlBuilder()
        const instance = datastoreProvider({
          httpProvider,
          urlBuilder,
        })
        const modelInstance = TestModel.create({ name: 'My Name'})
        // @ts-ignore
        await instance.bulkInsert<TestModelType, Model<TestModelType>>(TestModel, [modelInstance])
        assert.isTrue(urlBuilder.buildModelUrl.called)
      })
    })
    describe('#search()', () => {
      it('should use the httpProvider passed in', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const instance = datastoreProvider({
          httpProvider,
        })
        // @ts-ignore
        await instance.search<TestModelType, Model<TestModelType>>(TestModel, {})
        assert.isTrue(httpProvider.called)
      })
      it('should use the urlBuilder passed in to call buildModelUrl', async () => {
        const httpProvider = mockHttpProvider({works: 'i think'})
        const urlBuilder = mockUrlBuilder()
        const instance = datastoreProvider({
          httpProvider,
          urlBuilder,
        })
        // @ts-ignore
        await instance.search<TestModelType, Model<TestModelType>>(TestModel, {})
        assert.isTrue(urlBuilder.buildModelUrl.called)
      })
    })
  })
})
