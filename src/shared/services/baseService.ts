import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class BaseService {
  protected http: AxiosInstance
  protected baseURL =
    import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

  constructor() {
    this.http = axios.create({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }

  async getAll<T>(config?: AxiosRequestConfig) {
    const response = await this.http.get<T[]>(this.baseURL, config)
    return response.data
  }

  async getById<T>(id: number, config?: AxiosRequestConfig) {
    const response = await this.http.get<T>(`${this.baseURL}/${id}`, config)
    return response.data
  }

  async create<D, T = D>(data: D, config?: AxiosRequestConfig) {
    const response = await this.http.post<T>(this.baseURL, data, config)
    return response.data
  }

  async update<D, T = D>(id: number, data: D, config?: AxiosRequestConfig) {
    const response = await this.http.put<T>(
      `${this.baseURL}/${id}`,
      data,
      config
    )
    return response.data
  }

  async delete(id: number, config?: AxiosRequestConfig) {
    const response = await this.http.delete(`${this.baseURL}/${id}`, config)
    return response.data
  }
}

export default BaseService
