import type { BusLineFeature, FeatureCollection } from '@/models/geoserver'
import type { AxiosResponse } from 'axios'
import { geoApi } from '@/api/config'
import { GEO_WORKSPACE } from '@/utils/constants'

export const getLines = async (/* cqlFilter: string */) => {
  const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_line`,
        // CQL_FILTER: cqlFilter,
      },
    })
  return data.features
}
