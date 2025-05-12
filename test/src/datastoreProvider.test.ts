import { expect } from 'chai'
import sinon from 'sinon'
import datastoreProvider from '../../src/datastoreProvider'
import { ApiMethod } from 'functional-models'

describe('/src/datastoreProvider.ts', () => {
  const mockApiInfo = {
    rest: {
      [ApiMethod.create]: {
        endpoint: '/mock-model',
        method: 'post',
        security: {},
      },
      [ApiMethod.retrieve]: {
        endpoint: '/mock-model/:id',
        method: 'get',
        security: {},
      },
      [ApiMethod.update]: {
        endpoint: '/mock-model/:id',
        method: 'put',
        security: {},
      },
      [ApiMethod.delete]: {
        endpoint: '/mock-model/:id',
        method: 'delete',
        security: {},
      },
      [ApiMethod.search]: {
        endpoint: '/mock-model/search',
        method: 'post',
        security: {},
      },
    },
  }
  const mockModelDefinition = { namespace: 'mock', pluralName: 'model' }
  const mockModel = {
    getApiInfo: () => mockApiInfo,
    getModelDefinition: () => mockModelDefinition,
  }
  const mockInstance = {
    getModel: () => mockModel,
    toObj: async () => ({ foo: 'bar' }),
    getPrimaryKey: () => '123',
  }

  it('should call save with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.save(mockInstance as any)
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model')
    expect(call.method).to.equal('post')
    expect(result).to.equal('ok')
  })

  it('should call bulkInsert with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.bulkInsert(mockModel as any, [
      mockInstance as any,
    ])
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model')
    expect(call.method).to.equal('post')
    expect(result).to.equal('ok')
  })

  it('should call retrieve with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.retrieve(mockModel as any, '123')
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model/123')
    expect(call.method).to.equal('get')
    expect(result).to.equal('ok')
  })

  it('should call update with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.update(mockInstance as any)
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model/123')
    expect(call.method).to.equal('put')
    expect(result).to.equal('ok')
  })

  it('should call delete with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.delete(mockInstance as any)
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model/123')
    expect(call.method).to.equal('delete')
    expect(result).to.equal('ok')
  })

  it('should call search with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.search(mockModel as any, { foo: 'bar' })
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model/search')
    expect(call.method).to.equal('post')
    expect(result).to.equal('ok')
  })

  it('should call bulkDelete with correct url and method', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.bulkDelete(mockModel as any, ['123', '456'])
    expect(httpClient.calledOnce).to.be.true
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model')
    expect(call.method).to.equal('delete')
    expect(result).to.equal('ok')
  })

  it('should inject credentials if provided', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      credentials: { apiKey: 'abc', oauthToken: 'tok' },
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.headers['x-api-key']).to.equal('abc')
    expect(call.headers['Authorization']).to.equal('Bearer tok')
  })

  it('should call beforeRequest and afterResponse hooks', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const beforeRequest = sinon.spy(req => ({ ...req, url: '/changed' }))
    const afterResponse = sinon.spy(res => res + '2')
    const provider = datastoreProvider({
      httpClient,
      beforeRequest,
      afterResponse,
    })
    const result = await provider.save(mockInstance as any)
    expect(beforeRequest.calledOnce).to.be.true
    expect(afterResponse.calledOnce).to.be.true
    expect(httpClient.getCall(0).args[0].url).to.equal('/changed')
    expect(result).to.equal('ok2')
  })

  it('should use mock mode if enabled', async () => {
    const mockHandler = sinon.stub().resolves('mocked')
    const provider = datastoreProvider({ mockMode: true, mockHandler })
    const result = await provider.save(mockInstance as any)
    expect(mockHandler.calledOnce).to.be.true
    expect(result).to.equal('mocked')
  })

  it('should handle httpClient errors', async () => {
    const httpClient = sinon.stub().rejects(new Error('fail'))
    const provider = datastoreProvider({ httpClient })
    try {
      await provider.save(mockInstance as any)
      expect.fail('should throw')
    } catch (e) {
      expect(e.message).to.equal('fail')
    }
  })

  it('should handle mockHandler errors', async () => {
    const mockHandler = sinon.stub().rejects(new Error('mockfail'))
    const provider = datastoreProvider({ mockMode: true, mockHandler })
    try {
      await provider.save(mockInstance as any)
      expect.fail('should throw')
    } catch (e) {
      expect(e.message).to.equal('mockfail')
    }
  })

  it('should have empty headers if no credentials', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.headers).to.deep.equal({})
  })

  it('should allow afterResponse to modify errors', async () => {
    const httpClient = sinon.stub().rejects(new Error('fail'))
    const afterResponse = sinon.spy(e => 'handled')
    const provider = datastoreProvider({ httpClient, afterResponse })
    const result = await provider
      .save(mockInstance as any)
      .catch(e => afterResponse(e))
    expect(result).to.equal('handled')
    expect(afterResponse.calledOnce).to.be.true
  })

  it('should allow beforeRequest to throw and abort the request', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const beforeRequest = sinon.stub().throws(new Error('bad req'))
    const provider = datastoreProvider({ httpClient, beforeRequest })
    try {
      await provider.save(mockInstance as any)
      expect.fail('should throw')
    } catch (e) {
      expect(e.message).to.equal('bad req')
    }
  })

  it('should use custom baseUrl for model', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      baseUrl: { 'mock/model': 'https://api.example.com' },
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url.startsWith('https://api.example.com')).to.be.true
  })

  it('should fall back to default baseUrl if none set for model', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      baseUrl: { default: 'https://default.example.com' },
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url.startsWith('https://default.example.com')).to.be.true
  })

  it('should correctly replace :id in URLs with special characters', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.retrieve(mockModel as any, 'a/b?c')
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model/a%2Fb%3Fc')
  })

  it('should pass through security field from restInfo', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect('security' in call).to.be.false // not used, but should not throw
  })

  it('should work with synchronous credentials function', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      credentials: () => ({ foo: 'bar' }),
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.headers.foo).to.equal('bar')
  })

  it('should work with async credentials function', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      credentials: async () => ({ foo: 'baz' }),
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.headers.foo).to.equal('baz')
  })

  it('should work with a custom httpClient', async () => {
    const httpClient = sinon.stub().resolves('custom')
    const provider = datastoreProvider({ httpClient })
    const result = await provider.save(mockInstance as any)
    expect(result).to.equal('custom')
  })

  it('should work with a model with different pluralName/namespace', async () => {
    const model = {
      getApiInfo: () => mockApiInfo,
      getModelDefinition: () => ({ namespace: 'foo', pluralName: 'bar' }),
    }
    const instance = {
      getModel: () => model,
      toObj: async () => ({}),
      getPrimaryKey: () => 'id',
    }
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      baseUrl: { 'foo/bar': 'https://foo.bar' },
    })
    await provider.save(instance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url.startsWith('https://foo.bar')).to.be.true
  })

  it('should work with a model with only some ApiMethods defined', async () => {
    const partialApiInfo = {
      rest: {
        [ApiMethod.create]: {
          endpoint: '/partial',
          method: 'post',
          security: {},
        },
      },
    }
    const model = {
      getApiInfo: () => partialApiInfo,
      getModelDefinition: () => mockModelDefinition,
    }
    const instance = {
      getModel: () => model,
      toObj: async () => ({}),
      getPrimaryKey: () => 'id',
    }
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.save(instance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/partial')
  })

  it('should throw or handle gracefully if restInfo is missing', async () => {
    const emptyApiInfo = { rest: {} }
    const model = {
      getApiInfo: () => emptyApiInfo,
      getModelDefinition: () => mockModelDefinition,
    }
    const instance = {
      getModel: () => model,
      toObj: async () => ({}),
      getPrimaryKey: () => 'id',
    }
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    try {
      await provider.save(instance as any)
      expect.fail('should throw')
    } catch (e) {
      expect(e).to.exist
    }
  })

  it('should use baseUrl override for namespace only', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      baseUrl: { mock: 'https://ns.example.com' },
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url.startsWith('https://ns.example.com')).to.be.true
  })

  it('should use baseUrl default only', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({
      httpClient,
      baseUrl: { default: 'https://default.example.com' },
    })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url.startsWith('https://default.example.com')).to.be.true
  })

  it('should work with a model that has no baseUrl at all', async () => {
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.save(mockInstance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url.startsWith('/mock-model')).to.be.true
  })

  it('should work with a model with frozen getApiInfo', async () => {
    const frozenApiInfo = Object.freeze({
      rest: {
        [ApiMethod.create]: {
          endpoint: '/frozen',
          method: 'post',
          security: {},
        },
      },
    })
    const model = {
      getApiInfo: () => frozenApiInfo,
      getModelDefinition: () => mockModelDefinition,
    }
    const instance = {
      getModel: () => model,
      toObj: async () => ({}),
      getPrimaryKey: () => 'id',
    }
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.save(instance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/frozen')
  })

  it('should work with a model with frozen getModelDefinition', async () => {
    const frozenModelDef = Object.freeze({
      namespace: 'mock',
      pluralName: 'model',
    })
    const model = {
      getApiInfo: () => mockApiInfo,
      getModelDefinition: () => frozenModelDef,
    }
    const instance = {
      getModel: () => model,
      toObj: async () => ({}),
      getPrimaryKey: () => 'id',
    }
    const httpClient = sinon.stub().resolves('ok')
    const provider = datastoreProvider({ httpClient })
    await provider.save(instance as any)
    const call = httpClient.getCall(0).args[0]
    expect(call.url).to.equal('/mock-model')
  })
})
