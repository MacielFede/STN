import type { AxiosResponse } from 'axios'
import type { BusStopLine } from '../models/database'
import type { BusLineFeature, FeatureCollection } from '../models/geoserver'
import { api, geoApi } from '@/api/config'
import {
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

export async function fetchBusLinesByPoint([lng, lat]: [number, number]) {
  const cql = `DWITHIN(geometry, POINT(${lng} ${lat}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`
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
