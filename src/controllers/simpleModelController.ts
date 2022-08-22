import { ValidationError } from 'functional-models/errors'
import { FunctionalModel } from 'functional-models/interfaces'
import { ormQueryBuilder } from 'functional-models-orm/ormQuery'
import { OrmModel } from 'functional-models-orm/interfaces'
import { ModelController, ExpressRequestFunction, MaybePromise } from '../interfaces'

const simpleModelController = <T extends FunctionalModel, TModel extends OrmModel<T>>(ormModel: TModel) : ModelController => {

  const _safeDo = (func: (req: any, res: any) => MaybePromise<void|object>) : ExpressRequestFunction => (req: any, res: any) => {
    return Promise.resolve()
      .then(async () => {
        const result = await func(req, res)
        res.status(200).json(result)
        return
      })
      .catch(e => {
        console.error(e)
        if (e instanceof ValidationError || e.name === 'ValidationError') {
          res.status(400).json({
            error: {
              type: 'ValidationError',
              errors: e.keysToErrors
            }
          })
          return
        }
        res.status(500).json({
          error: {
            type: 'UnhandledException',
            message: `${e.message}`,
          }
        })
        return
      })
  }

  const save : ExpressRequestFunction = _safeDo(async (req, res) => {
    const body = req.body
    const primaryKeyName = ormModel.getPrimaryKeyName()
    return ormModel.create({...body, [primaryKeyName]: req.params.id}).save().then(x=>x.toObj())
  })

  const retrieve : ExpressRequestFunction = _safeDo(async (req, res) => {
    return ormModel.retrieve(req.params.id)
  })

  const deleteObj : ExpressRequestFunction = _safeDo(async (req, res) => {
    return ormModel.delete(req.params.id)
  })

  const search : ExpressRequestFunction = _safeDo(async (req, res) => {
    return ormModel.search(req.body)
  })

  const bulkInsert : ExpressRequestFunction = _safeDo(async (req, res) => {
    const asModels = req.body.map((obj: any) => ormModel.create(obj))
    return ormModel.bulkInsert(asModels)
  })

  const count : ExpressRequestFunction = _safeDo(async (req, res) => {
    return ormModel.count()
  })

  return {
    save,
    retrieve,
    delete: deleteObj,
    search,
    bulkInsert,
    count,
  }
}

export default simpleModelController
