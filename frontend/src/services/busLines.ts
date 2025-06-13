import type { BusLineFeature, FeatureCollection } from '@/models/geoserver'
import type { AxiosResponse } from 'axios'
import { geoApi } from '@/api/config'
import { GEO_WORKSPACE } from '@/utils/constants'

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
