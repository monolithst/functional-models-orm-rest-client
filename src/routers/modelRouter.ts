import express from 'express'
import invoke from 'lodash/invoke'
import omit from 'lodash/omit'
import { FunctionalModel } from 'functional-models/interfaces'
import { OrmModel, OrmModelInstance } from 'functional-models-orm/interfaces'
import { ModelController } from '../interfaces'

type ModelRouterChoice = 'save' | 'retrieve' | 'delete' | 'search' | 'bulkInsert'

type ModelRouterInput<T extends FunctionalModel, TModel extends OrmModel<T>> = {
  model: OrmModel<T>,
  modelController: ModelController,
  functionsToRemove?: ModelRouterChoice[],
}

const modelRouter = <T extends FunctionalModel, TModel extends OrmModel<T>>({
  model,
  modelController,
  functionsToRemove=[],
}: ModelRouterInput<T, TModel>) => {
  const router = express.Router()
  const functions: {[s: string]: [string,string, Function]} = {
    save: ['put', ':id', modelController.save],
    retrieve: ['get', ':id', modelController.retrieve],
    delete: ['delete', ':id', modelController.delete],
    search: ['post', '', modelController.search],
    insertBulk: ['post', 'insert', modelController.bulkInsert],
    count: ['post', 'count', modelController.count],
  }

  const toCreate = omit(functions, functionsToRemove)
  Object.values<[string,string,Function]>(toCreate)
    .forEach(([routerFunc, urlPath, func]) => {
      const url = `/${model.getName().toLowerCase()}/${urlPath}`
      invoke(router, routerFunc, url, func)
    })
  return router
}

export default modelRouter
