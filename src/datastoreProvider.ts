import {
  ModelInstance,
  ModelType,
  PrimaryKeyType,
  ApiMethod,
  DataDescription,
} from 'functional-models'
import { axiosInstance } from './axios'
import { HttpClient, RestClientProviderConfig } from './types'
import { createOAuth2Manager } from './oauth2'

const datastoreProvider = (
  config: RestClientProviderConfig = { baseUrl: { default: '' } }
) => {
  // Use provided httpClient or default to axiosInstance
  const httpClient: HttpClient =
    typeof axiosInstance === 'function' ? axiosInstance() : axiosInstance
  const finalHttpClient: HttpClient = config.httpClient || httpClient

  // OAuth2 manager (if needed)
  const oauth2Manager = config.oauth2
    ? createOAuth2Manager(config.oauth2, finalHttpClient)
    : null

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
    if (oauth2Manager) {
      // Do not set header here; handled in handleRequest for retries
      return {}
    }
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
  const handleRequest = async (request: any, model?: any) => {
    const reqWithHooks = config.beforeRequest
      ? await config.beforeRequest(request)
      : request
    if (config.mockMode && config.mockHandler) {
      const response = await config.mockHandler(reqWithHooks)
      return config.afterResponse ? config.afterResponse(response) : response
    }
    const doRequest = async () => {
      const baseReq = { ...reqWithHooks }
      const headers = baseReq.headers || {}
      const reqFinal =
        oauth2Manager && model
          ? {
              ...baseReq,
              headers: {
                ...headers,
                Authorization: `Bearer ${await oauth2Manager.getAccessToken()}`,
              },
            }
          : baseReq
      const response = await finalHttpClient(reqFinal)
      return config.afterResponse ? config.afterResponse(response) : response
    }
    if (oauth2Manager) {
      return oauth2Manager.handle401AndRetry(doRequest)
    }
    return doRequest()
  }

  // CREATE (single)
  const save = async <T extends DataDescription>(instance: ModelInstance<T>) =>
    handleRequest(
      {
        ...(() => {
          const model = instance.getModel()
          const { url, method } = resolveApiInfo(
            model,
            ApiMethod.create,
            config
          )
          return { url, method, headers: undefined, data: undefined, model }
        })(),
        headers: await getHeaders(instance.getModel()),
        data: await instance.toObj(),
      },
      instance.getModel()
    )

  // BULK INSERT
  const bulkInsert = async <T extends DataDescription>(
    model: any,
    instances: readonly ModelInstance<T>[]
  ) =>
    handleRequest(
      {
        ...(() => {
          const { url, method } = resolveApiInfo(
            model,
            ApiMethod.create,
            config
          )
          return { url, method, headers: undefined, data: undefined }
        })(),
        headers: await getHeaders(model),
        data: await Promise.all(instances.map(i => i.toObj())),
      },
      model
    )

  // RETRIEVE
  const retrieve = async (model: any, id: PrimaryKeyType) =>
    handleRequest(
      {
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
      },
      model
    )

  // UPDATE
  const update = async <T extends DataDescription>(
    instance: ModelInstance<T>
  ) =>
    handleRequest(
      {
        ...(() => {
          const model = instance.getModel()
          const { url, method } = resolveApiInfo(
            model,
            ApiMethod.update,
            config
          )
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
      },
      instance.getModel()
    )

  // DELETE (single)
  const deleteObj = async <T extends DataDescription>(
    instance: ModelInstance<T>
  ) =>
    handleRequest(
      {
        ...(() => {
          const model = instance.getModel()
          const { url, method } = resolveApiInfo(
            model,
            ApiMethod.delete,
            config
          )
          const id = instance.getPrimaryKey()
          return {
            url: url.replace(':id', encodeURIComponent(String(id))),
            method,
            headers: undefined,
          }
        })(),
        headers: await getHeaders(instance.getModel()),
      },
      instance.getModel()
    )

  // SEARCH
  const search = async <T extends DataDescription>(
    model: ModelType<T>,
    ormQuery: any
  ) =>
    handleRequest(
      {
        ...(() => {
          const { url, method } = resolveApiInfo(
            model,
            ApiMethod.search,
            config
          )
          return { url, method, headers: undefined, data: undefined }
        })(),
        headers: await getHeaders(model),
        data: ormQuery,
      },
      model
    )

  // BULK DELETE (custom, not in functional-models spec)
  const bulkDelete = async <T extends DataDescription>(
    model: ModelType<T>,
    ids: readonly PrimaryKeyType[]
  ) =>
    handleRequest(
      {
        ...(() => {
          const { url, method } = resolveApiInfo(
            model,
            ApiMethod.delete,
            config
          )
          return {
            url: url.replace(/\/:id$/u, ''),
            method,
            headers: undefined,
            data: undefined,
          }
        })(),
        headers: await getHeaders(model),
        data: ids,
      },
      model
    )

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
