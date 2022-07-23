import { kebabCase } from 'lodash'
import { Model, FunctionalModel, PrimaryKeyType } from 'functional-models/interfaces'
import {
  DatastoreMethod,
  HttpMethod,
  UrlBuilder,
  HttpMethodGetter,
  HttpHeaderGetter,
} from './interfaces'

const standardHeaderGetter = () : HttpHeaderGetter => () => Promise.resolve({
  'Content-Type': 'application/json',
})

const standardUrlBuilder = () : UrlBuilder => {
  return {
    buildModelUrl: <T extends FunctionalModel>(method: DatastoreMethod, model: Model<T>) => {
      const modelName = kebabCase(model.getName()).toLowerCase()
      return `/api/${modelName}${method === DatastoreMethod.bulkInsert ? '/insert' : ''}`
    },
    buildModelInstanceUrl: <T extends FunctionalModel>(method: DatastoreMethod, model: Model<T>, id: PrimaryKeyType) => {
      const modelName = kebabCase(model.getName()).toLowerCase()
      return `/api/${modelName}/${id}`
    }
  }
}

const standardHttpMethodGetter = () : HttpMethodGetter => {
  return (datastoreMethod: DatastoreMethod) => {
    switch (datastoreMethod){
      case(DatastoreMethod.save): return HttpMethod.put
      case(DatastoreMethod.retrieve): return HttpMethod.get
      case(DatastoreMethod.delete): return HttpMethod.delete
      case(DatastoreMethod.bulkInsert): return HttpMethod.post
      case(DatastoreMethod.search): return HttpMethod.post
      default: 
        throw new Error(`Unhandled method ${datastoreMethod}`)
    }
  }
}

const defaultInstance = <T>(value: T|undefined|null, defaultFunc: () => T) : T => {
  if (Boolean(value) === false) {
    return defaultFunc()
  }
  return value as T
}

export {
  defaultInstance,
  standardHeaderGetter,
  standardUrlBuilder,
  standardHttpMethodGetter,
}
