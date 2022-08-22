import express from 'express'
import { FunctionalModel } from 'functional-models/interfaces'
import { OrmModel, OrmModelInstance } from 'functional-models-orm/interfaces'
import modelRouter from './modelRouter'
import { simpleModelController } from '../controllers'

const modelApiRouter = (models: OrmModel<any>[]) => {
  const router = express.Router()
  models.forEach(model => {
    router.use('/api', modelRouter({
      model,
      modelController: simpleModelController(model),
    }))
  })
  return router
}

export default modelApiRouter
