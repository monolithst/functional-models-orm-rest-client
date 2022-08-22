type MaybePromise<T> = Promise<T>|T
type ExpressRequestFunction = (req: any, res: any) => MaybePromise<void> 

type ModelController = {
  save: ExpressRequestFunction,
  retrieve: ExpressRequestFunction,
  delete: ExpressRequestFunction,
  search: ExpressRequestFunction,
  bulkInsert: ExpressRequestFunction,
  count: ExpressRequestFunction,
}

export {
  ModelController,
  ExpressRequestFunction,
  MaybePromise,
}
