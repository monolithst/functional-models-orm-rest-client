import { MaybePromise } from './interfaces'

const mapAsync = <T, TResult>(values: readonly T[], transformationFunc: (T: T) => MaybePromise<TResult>) : Promise<readonly TResult[]> => {
  return values.reduce(async (accP: Promise<TResult[]>, value: T) => {
    const acc = await accP
    const transformed = await transformationFunc(value)
    return [...acc, transformed]
  }, Promise.resolve([]))
} 

export {
  mapAsync
}
