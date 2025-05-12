import MockAdapter from 'axios-mock-adapter'
import { assert } from 'chai'
import axios from 'axios'
import { axiosInstance } from '../../src/axios'
import { HttpMethod } from '../../src/types'

describe('/src/axios.ts', () => {
  describe('#axiosInstance()', () => {
    it('should should call axios with GET method when the HttpMethod.get is used', async () => {
      const stub = new MockAdapter(axios)
      stub.onGet('anything').replyOnce(200, { did: 'get' })
      const result = await axiosInstance()({
        method: HttpMethod.get,
        url: 'anything',
      })
      assert.deepEqual(result, { did: 'get' })
    })
    it('should should call axios with PUT method when the HttpMethod.put is used', async () => {
      const stub = new MockAdapter(axios)
      stub.onPut('anything').replyOnce(200, { did: 'put' })
      const result = await axiosInstance()({
        method: HttpMethod.put,
        url: 'anything',
      })
      assert.deepEqual(result, { did: 'put' })
    })
  })
})
