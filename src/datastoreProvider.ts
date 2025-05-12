import {
  ModelInstance,
  ModelType,
  PrimaryKeyType,
  ApiMethod,
  DataDescription,
} from 'functional-models'
import { axiosInstance } from './axios'
import { HttpClient, RestClientProviderConfig } from './types'

const datastoreProvider = (
  config: RestClientProviderConfig = { baseUrl: { default: '' } }
) => {
  // Use provided httpClient or default to axiosInstance
  const httpClient: HttpClient =
    typeof axiosInstance === 'function' ? axiosInstance() : axiosInstance
  const finalHttpClient: HttpClient = config.httpClient || httpClient

  // Utility to resolve baseUrl for a given model
  const resolveBaseUrl = (
    config: RestClientProviderConfig,
    namespace: string,
    modelName: string
  ): string => {
    if (config.baseUrl) {
      if (config.baseUrl[`${namespace}/${modelName}`]) {
        return config.baseUrl[`${namespace}/${modelName}`]
      }
      if (config.baseUrl[namespace]) {
        return config.baseUrl[namespace]
      }
      if (config.baseUrl.default) {
        return config.baseUrl.default
      }
    }
    return ''
  }

  // Utility to resolve endpoint and method for a given model and ApiMethod
  const resolveApiInfo = (
    model: any,
    apiMethod: ApiMethod,
    config: RestClientProviderConfig
  ) => {
    const apiInfo = model.getApiInfo()
    const restInfo = apiInfo.rest[apiMethod]
    const namespace = model.getModelDefinition().namespace
    const pluralName = model.getModelDefinition().pluralName
    const baseUrl = resolveBaseUrl(config, namespace, pluralName)
    const url = baseUrl.replace(/\/$/u, '') + restInfo.endpoint // Ensure no double slashes
    return {
      url,
      method: restInfo.method,
      security: restInfo.security,
    }
  }

  // Helper to get headers (credentials)
  const getHeaders = async (model: any) => {
    const namespace = model.getModelDefinition().namespace
    const modelName = model.getModelDefinition().pluralName
    return typeof config.credentials === 'function'
      ? config.credentials({ namespace, modelName })
      : typeof config.credentials === 'object' && config.credentials
        ? {
            ...(config.credentials.apiKey
              ? { 'x-api-key': config.credentials.apiKey }
              : {}),
            ...(config.credentials.oauthToken
              ? { Authorization: `Bearer ${config.credentials.oauthToken}` }
              : {}),
          }
        : {}
  }

  // Helper to handle hooks and mock mode
  const handleRequest = async (request: any) => {
    if (config.beforeRequest) {
      request = await config.beforeRequest(request)
    }
    if (config.mockMode && config.mockHandler) {
      const response = await config.mockHandler(request)
      return config.afterResponse ? config.afterResponse(response) : response
    }
    const response = await finalHttpClient(request)
    return config.afterResponse ? config.afterResponse(response) : response
  }

  // CREATE (single)
  const save = async <T extends DataDescription>(instance: ModelInstance<T>) =>
    handleRequest({
      ...(() => {
        const model = instance.getModel()
        const { url, method } = resolveApiInfo(model, ApiMethod.create, config)
        return { url, method, headers: undefined, data: undefined, model }
      })(),
      headers: await getHeaders(instance.getModel()),
      data: await instance.toObj(),
    })

  // BULK INSERT
  const bulkInsert = async <T extends DataDescription>(
    model: any,
    instances: readonly ModelInstance<T>[]
  ) =>
    handleRequest({
      ...(() => {
        const { url, method } = resolveApiInfo(model, ApiMethod.create, config)
        return { url, method, headers: undefined, data: undefined }
      })(),
      headers: await getHeaders(model),
      data: await Promise.all(instances.map(i => i.toObj())),
    })

  // RETRIEVE
  const retrieve = async (model: any, id: PrimaryKeyType) =>
    handleRequest({
      ...(() => {
        const { url, method } = resolveApiInfo(
          model,
          ApiMethod.retrieve,
          config
        )
        return {
          url: url.replace(':id', encodeURIComponent(String(id))),
          method,
          headers: undefined,
        }
      })(),
      headers: await getHeaders(model),
    })

  // UPDATE
  const update = async <T extends DataDescription>(
    instance: ModelInstance<T>
  ) =>
    handleRequest({
      ...(() => {
        const model = instance.getModel()
        const { url, method } = resolveApiInfo(model, ApiMethod.update, config)
        const id = instance.getPrimaryKey()
        return {
          url: url.replace(':id', encodeURIComponent(String(id))),
          method,
          headers: undefined,
          data: undefined,
        }
      })(),
      headers: await getHeaders(instance.getModel()),
      data: await instance.toObj(),
    })

  // DELETE (single)
  const deleteObj = async <T extends DataDescription>(
    instance: ModelInstance<T>
  ) =>
    handleRequest({
      ...(() => {
        const model = instance.getModel()
        const { url, method } = resolveApiInfo(model, ApiMethod.delete, config)
        const id = instance.getPrimaryKey()
        return {
          url: url.replace(':id', encodeURIComponent(String(id))),
          method,
          headers: undefined,
        }
      })(),
      headers: await getHeaders(instance.getModel()),
    })

  // SEARCH
  const search = async <T extends DataDescription>(
    model: ModelType<T>,
    ormQuery: any
  ) =>
    handleRequest({
      ...(() => {
        const { url, method } = resolveApiInfo(model, ApiMethod.search, config)
        return { url, method, headers: undefined, data: undefined }
      })(),
      headers: await getHeaders(model),
      data: ormQuery,
    })

  // BULK DELETE (custom, not in functional-models spec)
  const bulkDelete = async <T extends DataDescription>(
    model: ModelType<T>,
    ids: readonly PrimaryKeyType[]
  ) =>
    handleRequest({
      ...(() => {
        const { url, method } = resolveApiInfo(model, ApiMethod.delete, config)
        return {
          url: url.replace(/\/:id$/u, ''),
          method,
          headers: undefined,
          data: undefined,
        }
      })(),
      headers: await getHeaders(model),
      data: ids,
    })

  return {
    save,
    bulkInsert,
    retrieve,
    update,
    delete: deleteObj,
    search,
    bulkDelete,
  }
}

export default datastoreProvider
