import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import { api, geoApi } from '@/api/config'
import type { BusLineProperties } from "../models/database"
import type { FeatureCollection , BusLineFeature, BusLineFeatureCollection } from "../models/geoserver"
import {
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'




const _getLines = async () => {
  const { data }: AxiosResponse<BusLineFeatureCollection> = await geoApi.get(
    '',
    {
      params: {
        typeName: 'ne:ft_bus_line'
        
      },
    },
  )
  return data.features
}

export const getLines = debounce(
  async () => _getLines(),
  1000,
  {
    leading: true,
    trailing: true,
  },
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

