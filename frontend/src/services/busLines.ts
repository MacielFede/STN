import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import { api, geoApi } from '@/api/config'
import type { BusLineProperties, BusStopLine } from "../models/database"
import type { FeatureCollection , BusLineFeature, BusLineFeatureCollection } from "../models/geoserver"
import {
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'

/** ➊ función interna: ahora admite cqlFilter */
const _getLines = async (cqlFilter?: string) => {
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

/** ➋ export público, sigue debounced pero reenvía el argumento */
export const getLines = debounce(
  async (cqlFilter?: string) => _getLines(cqlFilter),
  1000,
  { leading: true, trailing: true },
)

export async function fetchBusLinesByPoint([lng, lat]: [number, number]): Promise<BusLineFeature[]> {
  const cql = `DWITHIN(geometry, POINT(${lng} ${lat}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`;
  const params = {
    typename: `${GEO_WORKSPACE}:ft_bus_line`,
    outputFormat: 'application/json',
    CQL_FILTER: cql
  }

  try {
    const response: AxiosResponse<{ features: BusLineFeature[] }> = await geoApi.get(
      '', 
      {
      params,
    })

    return response.data.features
  } catch (error) {
    console.error('Error al consultar líneas de bus:', error)
    return []
  }
}

/**
 * Obtiene las líneas específicas de una parada
 */
export async function getStopLines(stopId: number): Promise<Array<BusStopLine>> {
  try {
    const { data }: AxiosResponse<Array<BusStopLine>> = await api.get(
      `/stop-lines/by-stop/${stopId}`
    )
    return data
  } catch (error) {
    console.error('Error al obtener líneas de la parada:', error)
    return []
  }
}

/**
 * Obtiene todas las relaciones parada-línea
 */
export const getLinesByStop = async (): Promise<Array<BusStopLine>> => {
  try {
    const { data } = await api.get('/stop-lines', {})
    return data
  } catch (error) {
    console.error('Error al obtener relaciones parada-línea:', error)
    return []
  }
}
// export const getLines = async (cqlFilter: string) => {
//   if (!cqlFilter) return
//   const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
//     await geoApi.get('', {
//       params: {
//         typeName: `${GEO_WORKSPACE}:ft_bus_line`,
//         CQL_FILTER: cqlFilter,
//       },
//     })
//   return data.features
// }

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
