import type { AxiosResponse } from 'axios'
import type { BusStopLine } from '../models/database'
import type { BusLineFeature, BusLineFeatureCollection, BusStopFeature, FeatureCollection, LineStringGeometry, StreetFeature } from '../models/geoserver'
import { api, geoApi } from '@/api/config'
import {
  DISTANCE_BETWEEN_LINE_AND_STREET,
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'

export const getLines = async (cqlFilter: string) => {
  const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_line`,
        CQL_FILTER: cqlFilter,
      },
    })
  return data.features
}

export const getByStop = async (stopId: string) => {
  const { data }: AxiosResponse<Array<BusStopLine>> =
    await api.get(`/stop-lines/by-stop/${stopId}`)
  return data;
}

export const createBusLine = async (line: BusLineFeature) => {
  return await api.post('/bus-lines', {
    ...line.properties,
    geometry: line.geometry,
  })
}

export const updateBusLine = async (line: BusLineFeature) => {
  return await api.put(`/bus-lines/${line.properties.id}`, {
    ...line.properties,
    geometry: line.geometry,
  })
}

export const deleteBusLine = async (lineId: string) => {
  return await api.delete(`/bus-lines/${lineId}`)
}

export const createStopLine = async (
  stopId: string,
  lineId: string,
  estimatedTime: string,
  isEnabled: boolean = true
) => {
  return await api.post('/stop-lines', {
    stopId,
    lineId,
    estimatedTime,
    isEnabled,
  })
}

export const updateStopLine = async (
  stopLineId: string,
  stopId: string,
  lineId: string,
  estimatedTime: string,
  isEnabled: boolean = true
) => {
  return await api.put(`/stop-lines/${stopLineId}`, {
    stopId,
    lineId,
    estimatedTime,
    isEnabled,
  })
}

export const deleteStopLine = async (stopLineId: string) => {
  return await api.delete(`/stop-lines/${stopLineId}`)
}

export const getStopLineByBusLineId = async (busLineId: string) => {
  const { data }: AxiosResponse<Array<BusStopLine>> =
    await api.get(`/stop-lines/by-line/${busLineId}`)

  return data
}

export const isBusLineOnStreets = async (
  geometry: LineStringGeometry,
): Promise<any> => {
  const response: { status: boolean; errorPoints: number[][] } = {
    status: false,
    errorPoints: [],
  }
  const errorPoints: number[][] = [];
  const densified = densifyLineString(geometry.coordinates)
  for (const [lon, lat] of densified) {
    const street = await streetPointContext({ lon, lat })
    if (!street) {
      errorPoints.push([lon, lat]);
    }
  }
  if (errorPoints.length > 0) {
    response.status = false;
    response.errorPoints = errorPoints;
    return response;
  }
  response.status = true;
  return response;
}
export const isOriginStopOnStreet = async (
  originStop: BusStopFeature,
  busLine: BusLineFeature
): Promise<boolean> => {
  const [lineLon, lineLat] = busLine.geometry.coordinates[0]

  const { data }: AxiosResponse<FeatureCollection<BusStopFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_stop`,
        CQL_FILTER: `DWITHIN(geometry, POINT(${lineLon} ${lineLat}), 20, meters) AND id = ${originStop.properties.id}`,
      },
    })

  return data.features.length > 0
}

export const isDestinationStopOnStreet = async (
  destinationStop: BusStopFeature,
  busLine: BusLineFeature
): Promise<boolean> => {
  const [lineLon, lineLat] = busLine.geometry.coordinates[busLine.geometry.coordinates.length - 1]

  const { data }: AxiosResponse<FeatureCollection<BusStopFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_stop`,
        CQL_FILTER: `DWITHIN(geometry, POINT(${lineLon} ${lineLat}), 20, meters) AND id = ${destinationStop.properties.id}`,
      },
    })

  return data.features.length > 0
}

export const isIntermediateStopOnStreet = async (
  intermediateStop: BusStopFeature,
  busLine: BusLineFeature
): Promise<boolean> => {
  const [originLon, originLat] = busLine.geometry.coordinates[0]
  const [destLon, destLat] = busLine.geometry.coordinates[busLine.geometry.coordinates.length - 1]

  const threshold = 0.0003
  const intermediateDensified = busLine.geometry.coordinates.filter(([lon, lat]) => {
    const distToOrigin = Math.sqrt((lon - originLon) ** 2 + (lat - originLat) ** 2)
    const distToDest = Math.sqrt((lon - destLon) ** 2 + (lat - destLat) ** 2)
    return distToOrigin > threshold && distToDest > threshold
  })

  if (intermediateDensified.length === 0) {
    return false
  }

  const wkt = `LINESTRING(${intermediateDensified.map(coord => `${coord[0]} ${coord[1]}`).join(', ')})`

  const { data }: AxiosResponse<FeatureCollection<BusStopFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_stop`,
        CQL_FILTER: `DWITHIN(geometry, ${wkt}, ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters) AND id = ${intermediateStop.properties.id}`,
      },
    })

  return data.features.length > 0
}

function densifyLineString(
  coordinates: [number, number][],
  maxSegmentLength = 0.0003 // approximately 30 meters
): [number, number][] {
  const densified: [number, number][] = []
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i]
    const [lon2, lat2] = coordinates[i + 1]
    densified.push([lon1, lat1])
    const dist = Math.sqrt((lon2 - lon1) ** 2 + (lat2 - lat1) ** 2)
    const steps = Math.ceil(dist / maxSegmentLength)
    for (let j = 1; j < steps; j++) {
      densified.push([
        lon1 + ((lon2 - lon1) * j) / steps,
        lat1 + ((lat2 - lat1) * j) / steps,
      ])
    }
  }
  densified.push(coordinates[coordinates.length - 1])
  return densified
}

export const streetPointContext = async ({
  lon,
  lat,
  isStop = false,
}: {
  lon: number
  lat: number
  isStop?: boolean
}) => {
  const stopCQLFilter = `DWITHIN(geom, POINT(${lat} ${lon}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`
  const lineCQLFilter = `DWITHIN(geom, POINT(${lon} ${lat}), ${DISTANCE_BETWEEN_LINE_AND_STREET}, meters)`
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: isStop ? stopCQLFilter : lineCQLFilter,
      },
    })

  return data.features.length > 0 ? data.features[0] : null
}

/** ➊ función interna: ahora admite cqlFilter */
export const _getLines = async (cqlFilter?: string) => {
  const params: Record<string, string> = {
    typeName: `${GEO_WORKSPACE}:ft_bus_line`,
    outputFormat: 'application/json',
  }
  if (cqlFilter) params.CQL_FILTER = cqlFilter

  const { data }: AxiosResponse<BusLineFeatureCollection> = await geoApi.get(
    '',
    { params },
  )
  return data.features
}

export const getLineFromGraphHopper = async (
  points: [number, number][],
): Promise<LineStringGeometry | null> => {
  if (!points || points.length === 0 || points.some(point => point.length !== 2)) {
    console.error('Puntos deben ser coordenadas válidas')
    return null
  }

  const params = new URLSearchParams()
  points.forEach(point => {
    params.append('point', `${point[1]},${point[0]}`)
  })
  params.append('profile', 'car')
  params.append('locale', 'es')
  params.append('type', 'json')
  params.append('key', 'c9900281-5f6e-483e-9159-1ef4103873d5')
  params.append('points_encoded', 'false')

  const url = `https://graphhopper.com/api/1/route?${params.toString()}`

  try {
    const response = await fetch(
      url,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    const route = await response.json()

    if (!route || route.error) {
      console.error('Error al obtener la ruta de GraphHopper:', route.error)
      return null
    }

    return route.paths[0].points
  } catch (error) {
    console.error('Error al obtener la ruta de GraphHopper:', error)
    return null
  }
}

export async function fetchBusLinesByPoint([lng, lat]: [number, number]) {
  const cql = `DWITHIN(geometry, POINT(${lat} ${lng}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`
  const params = {
    typename: `${GEO_WORKSPACE}:ft_bus_line`,
    outputFormat: 'application/json',
    CQL_FILTER: cql,
  }

  const response: AxiosResponse<{ features: Array<BusLineFeature> }> =
    await geoApi.get('', {
      params,
    })

  return response.data.features
}

export async function getStopLines(
  stopId: number,
): Promise<Array<BusStopLine>> {
  const { data }: AxiosResponse<Array<BusStopLine>> = await api.get(
    `/stop-lines/by-stop/${stopId}`,
  )
  return data
}

export const getLinesByStop = async () => {
  const { data }: AxiosResponse<Array<BusStopLine>> = await api.get(
    '/stop-lines',
    {},
  )
  return data
}

export const getLinesInStreet = async (streetCode?: string) => {
  if (!streetCode) return
  const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:bus_lines_in_streets`,
        viewparams: `st_code:${streetCode}`,
      },
    })

  return data.features
}
