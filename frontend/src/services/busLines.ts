import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import { api, geoApi } from '@/api/config'
import type { BusLineProperties, BusStopLine } from "../models/database"
import type { FeatureCollection , BusLineFeature, BusLineFeatureCollection } from "../models/geoserver"
import {
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'

export const getLines = async (cqlFilter: string) => {
  if (!cqlFilter) return
  const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_line`,
        CQL_FILTER: cqlFilter,
      },
    })
  return data.features
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
