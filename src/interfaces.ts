import { FunctionalModel, PrimaryKeyType, Model } from 'functional-models/interfaces'

enum HttpMethod {
  get='get',
  post='post',
  put='put',
  delete='delete',
  patch='patch',
}

type HttpClientInputs = {
  method: HttpMethod,
  url: string,
  data?:Object,
  headers?:Object
}

type HttpClient = <T>(inputs: HttpClientInputs) => Promise<T>

type MaybePromise<T> = T|Promise<T>

type UrlBuilder = {
  buildModelUrl: <T extends FunctionalModel>(method: DatastoreMethod, model: Model<T>) => string,
  buildModelInstanceUrl: <T extends FunctionalModel>(method: DatastoreMethod, model: Model<T>, id: PrimaryKeyType) => string,
}

enum DatastoreMethod {
  save,
  retrieve,
  delete,
  bulkInsert,
  search,
}

type HttpMethodGetter = (datastoreMethod: DatastoreMethod) => HttpMethod

type HttpHeaderGetter = () => Promise<Object>


export {
  HttpMethod,
  HttpClientInputs,
  HttpClient,
  MaybePromise,
  UrlBuilder,
  HttpMethodGetter,
  DatastoreMethod,
  HttpHeaderGetter,
}
