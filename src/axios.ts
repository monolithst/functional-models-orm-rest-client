import get from 'lodash/get'
import axios from 'axios'
import { AxiosRequestHeaders } from 'axios'
import { AxiosResponse } from 'axios'
import { HttpClient, HttpClientInputs} from './interfaces'

const axiosInstance = () : HttpClient => {
  const httpClient: HttpClient = <T>({method, url, data, headers}: HttpClientInputs) => {
    return axios[method](url, {data, headers: headers as AxiosRequestHeaders})
      .then((response: AxiosResponse) => {
        return response.data as T
      })
  }
  return httpClient
}


export {
  axiosInstance
}
