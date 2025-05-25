import axios from 'axios'

const backendBaseURL = 'http://localhost:8080/api/'
export const api = axios.create({ baseURL: backendBaseURL })

api.interceptors.response.use(
  (response) => {
    if (response.config.url?.endsWith('/auth/login') && response.data.token) {
      api.defaults.headers.common['Authorization'] =
        `Bearer ${response.data.token}`
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

const geoserverBaseURL = 'http://localhost:8000/geoserver/citeows'
export const geoBaseParams = {
  service: 'WFS',
  version: '1.0.0',
  request: 'GetFeature',
  outputFormat: 'application/json',
}

export const geoApi = axios.create({
  baseURL: geoserverBaseURL,
  headers: {
    'Access-Control-Allow-Origin': true,
  },
})
