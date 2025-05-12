enum HttpMethod {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  patch = 'patch',
}

type HttpClientInputs = {
  method: HttpMethod
  url: string
  data?: object
  headers?: object
}

type HttpClient = <T>(inputs: HttpClientInputs) => Promise<T>

enum DatastoreMethod {
  save,
  retrieve,
  delete,
  bulkInsert,
  search,
}

export type RestClientProviderConfig = Readonly<{
  baseUrl?: {
    default: string
    [namespace: string]: string
    // e.g. 'namespace/model': 'https://api.example.com/model'
  }
  credentials?:
    | { apiKey?: string; oauthToken?: string }
    | ((opts: {
        namespace: string
        modelName: string
      }) => Promise<Record<string, string>>)
  oauth2?: {
    tokenUrl: string
    clientId: string
    clientSecret: string
    // For future extensibility: audience?: string; extraParams?: Record<string, string>
  }
  mockMode?: boolean
  mockHandler?: (request: any) => Promise<any>
  beforeRequest?: (request: any) => Promise<any> | any
  afterResponse?: (response: any) => Promise<any> | any
  httpClient?: HttpClient // Optional custom http client (e.g., axios instance)
}>

export { HttpMethod, HttpClientInputs, HttpClient, DatastoreMethod }
