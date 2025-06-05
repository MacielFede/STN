import type { AxiosResponse } from 'axios'
import type { LineStopRelationship } from '@/models/database'
import type { BusLineFeature, FeatureCollection, LineStringGeometry, StreetFeature } from '@/models/geoserver'
import { api, geoApi } from '@/api/config'
import { DISTANCE_BETWEEN_STOPS_AND_STREET, GEO_WORKSPACE } from '@/utils/constants'

export const getLinesByStopId = async (stopId: number) => {
  const { data: linesInStop }: AxiosResponse<Array<LineStopRelationship>> =
    await api.get(`/stop-lines/by-stop/${stopId}`)

  const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_line`,
        CQL_FILTER: `id IN(${linesInStop.map((rel, index) => (index === linesInStop.length ? `'${rel.lineId},'` : `${rel.lineId}'`))})`,
      },
    })
  return data.features
}

export const createBusLine = async (line: BusLineFeature) => {
  return await api.post('/bus-lines', {
    ...line.properties,
    geometry: line.geometry,
  })
}

export const isBusLineOnStreets = async (
  geometry: LineStringGeometry,
): Promise<boolean> => {
  const densified = densifyLineString(geometry.coordinates)
  for (const [lon, lat] of densified) {
    const street = await streetPointContext({ lon, lat })
    if (!street) {
      return false
    }
  }
  return true
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

const streetPointContext = async ({
  lon,
  lat,
}: {
  lon: number
  lat: number
}) => {
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: `DWITHIN(geom, POINT(${lon} ${lat}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`,
      },
    })

  return data.features.length > 0 ? data.features[0] : null
}
