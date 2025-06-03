import Cookies from 'js-cookie'
import { XMLParser } from 'fast-xml-parser'
import axios from 'axios'
import { transformKeysToCamelCase } from '@/utils/helpers'
import { GEO_WORKSPACE } from '@/utils/constants'

const backendBaseURL = 'http://localhost:8080/api'
export const api = axios.create({ baseURL: backendBaseURL })

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin-jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('admin-jwt')
    }
    return Promise.reject(error)
  },
)

const geoserverBaseURL = `http://localhost:8000/geoserver/${GEO_WORKSPACE}/ows`
const geoBaseParams = {
  service: 'WFS',
  version: '1.0.0',
  request: 'GetFeature',
  outputFormat: 'application/json',
}

export const geoApi = axios.create({
  baseURL: geoserverBaseURL,
  params: geoBaseParams,
})

geoApi.interceptors.response.use(
  async (response) => {
    const contentType = response.headers['content-type']

    // Check if response is XML (GeoServer error)
    if (contentType && contentType.includes('xml')) {
      try {
        const parser = new XMLParser()
        const json = parser.parse(response.data)
        const errorText =
          json?.['ows:ExceptionReport']?.['ows:Exception']?.[
            'ows:ExceptionText'
          ]

        // Reject the promise with a custom error
        return Promise.reject(new Error(`GeoServer XML Error: ${errorText}`))
      } catch (parseError) {
        return Promise.reject(
          new Error(
            `Received XML response but failed to parse it: ${parseError}`,
          ),
        )
      }
    } // Only apply transformation to GeoJSON-like objects
    if (
      response.data &&
      typeof response.data === 'object' &&
      Array.isArray(response.data.features)
    ) {
      const camelData = transformKeysToCamelCase(response.data)
      return {
        ...response,
        data: camelData,
      }
    }

    return response
  },
  (error) => {
    // Handle transport-level errors here
    return Promise.reject(error)
  },
)
