/* eslint-disable no-console */
import Cookies from 'js-cookie'
import { XMLParser } from 'fast-xml-parser'
import axios from 'axios'
import { transformKeysToCamelCase } from '@/utils/helpers'
import { GEO_WORKSPACE } from '@/utils/constants'

const backendBaseURL = 'http://localhost:8080/api/'
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

    // Handle XML GeoServer error
    if (contentType && contentType.includes('xml')) {
      try {
        const parser = new XMLParser()
        const json = parser.parse(response.data)
        const errorText =
          json?.['ExceptionReport']?.['Exception']?.['ExceptionText'] ??
          json?.['ServiceExceptionReport']?.['ServiceException'] ??
          'Unknown GeoServer error'
        return Promise.reject(new Error(`GeoServer XML Error: ${errorText}`))
      } catch (parseError) {
        console.error('Failed to parse XML error:', parseError)
        return Promise.reject(
          new Error(
            `Received XML response but failed to parse it: ${parseError}`,
          ),
        )
      }
    }

    // Transform GeoJSON feature keys to camelCase
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
    // Make sure to log unexpected errors as well
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)
