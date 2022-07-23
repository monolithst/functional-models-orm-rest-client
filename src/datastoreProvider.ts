import { DatastoreProvider, OrmModelInstance, OrmQuery, DatastoreSearchResult, OrmModel } from 'functional-models-orm/interfaces'
import { ModelInstance, FunctionalModel, Model, PrimaryKeyType, ModelInstanceInputData } from 'functional-models/interfaces'
import { axiosInstance } from './axios'
import { 
  HttpClient,
  HttpMethod,
  UrlBuilder,
  HttpMethodGetter,
  DatastoreMethod,
  HttpHeaderGetter,
} from './interfaces'
import {
  defaultInstance,
  standardHeaderGetter,
  standardUrlBuilder,
  standardHttpMethodGetter,
} from './defaultFunctions'
import { mapAsync } from './utils'


const datastoreProvider = (inputs: {
  httpProvider?: HttpClient,
  urlBuilder?: UrlBuilder,
  httpMethodGetter?: HttpMethodGetter,
  httpHeaderGetter?: HttpHeaderGetter,
}={}) : DatastoreProvider => {
  const {
    httpProvider = defaultInstance<HttpClient>(inputs.httpProvider, axiosInstance) as HttpClient,
    urlBuilder = defaultInstance<UrlBuilder>(inputs.urlBuilder, standardUrlBuilder) as UrlBuilder,
    httpMethodGetter = defaultInstance<HttpMethodGetter>(inputs.httpMethodGetter, standardHttpMethodGetter) as HttpMethodGetter,
    httpHeaderGetter = defaultInstance<HttpHeaderGetter>(inputs.httpHeaderGetter, standardHeaderGetter) as HttpHeaderGetter,
  } = inputs

  const save = <T extends FunctionalModel, TModel extends Model<T>>(
    instance: ModelInstance<T, TModel>
  ): Promise<ModelInstanceInputData<T>> => {
    return Promise.resolve()
      .then(async () => {
        const url = urlBuilder.buildModelInstanceUrl(DatastoreMethod.save, instance.getModel(), instance.getPrimaryKey())
        const method = httpMethodGetter(DatastoreMethod.save)
        const headers = await httpHeaderGetter()
        const data = await instance.toObj()
        return httpProvider({
          url,
          method,
          headers,
          data,
        }) as Promise<ModelInstanceInputData<T>>
      })
  }

  const bulkInsert = async <T extends FunctionalModel, TModel extends Model<T>>(
    model: TModel,
    instances: readonly ModelInstance<T, TModel>[]
  ) => {
    return Promise.resolve()
      .then(async () => {
        const url = urlBuilder.buildModelUrl(DatastoreMethod.bulkInsert, model)
        const method = httpMethodGetter(DatastoreMethod.bulkInsert)
        const headers = await httpHeaderGetter()
        const data = await mapAsync(instances, instance => instance.toObj()) 
        return httpProvider({
          url,
          method,
          headers,
          data,
        }) as Promise<void>
      })
  }

  const deleteObj = <T extends FunctionalModel, TModel extends Model<T>>(
    instance: ModelInstance<T, TModel>
  ) => {
    return Promise.resolve()
      .then(async () => {
        const url = urlBuilder.buildModelInstanceUrl(DatastoreMethod.delete, instance.getModel(), instance.getPrimaryKey())
        const method = httpMethodGetter(DatastoreMethod.delete)
        const headers = await httpHeaderGetter()
        return httpProvider({
          url,
          method,
          headers,
        }) as Promise<void>
    })
  }

  const search = <T extends FunctionalModel>(
    model: Model<T>,
    ormQuery: OrmQuery
  ) => {
    return Promise.resolve()
      .then(async () => {
        const url = urlBuilder.buildModelUrl(DatastoreMethod.search, model)
        const method = httpMethodGetter(DatastoreMethod.search)
        const headers = await httpHeaderGetter()
        return httpProvider({
          url,
          method,
          headers,
          data: ormQuery,
        }) as Promise<DatastoreSearchResult<T>>
      })
  }

  const retrieve = <T extends FunctionalModel>(
    model: Model<T>,
    id: PrimaryKeyType
  ) => {
    return Promise.resolve()
      .then(async () => {
        const url = urlBuilder.buildModelInstanceUrl(DatastoreMethod.retrieve, model, id)
        const method = httpMethodGetter(DatastoreMethod.retrieve)
        const headers = await httpHeaderGetter()
        return httpProvider({
          url,
          method,
          headers,
        }) as Promise<ModelInstanceInputData<T>>
    })
  }

  return {
    bulkInsert,
    search,
    retrieve,
    save,
    delete: deleteObj,
  }
}

export default datastoreProvider
