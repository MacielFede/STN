import { XMLParser } from 'fast-xml-parser'
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

const geoserverBaseURL = 'http://localhost:8000/geoserver/cite/ows'
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
    }

    return response // Continue normally if not XML
  },
  (error) => {
    // Handle transport-level errors here
    return Promise.reject(error)
  },
)
