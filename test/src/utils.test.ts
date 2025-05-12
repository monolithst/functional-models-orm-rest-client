import { mapAsync } from '../../src/utils'
import { assert } from 'chai'

describe('/src/utils.ts', () => {
  describe('#mapAsync()', () => {
    it('should apply the double function to the range of ints', async () => {
      const input = [1, 2, 3]
      const actual = await mapAsync(input, (num: number) => num * 2)
      const expected = [2, 4, 6]
      assert.deepEqual(actual, expected)
    })
    it('should await each promise to get the result', async () => {
      const input = [
        new Promise(r => setTimeout(() => r(1), 50)) as Promise<number>,
        new Promise(r => setTimeout(() => r(2), 50)) as Promise<number>,
        new Promise(r => setTimeout(() => r(3), 50)) as Promise<number>,
      ]
      const actual = await mapAsync(
        input,
        async (num: Promise<number>) => (await num) * 2
      )
      const expected = [2, 4, 6]
      assert.deepEqual(actual, expected)
    })
  })
})
