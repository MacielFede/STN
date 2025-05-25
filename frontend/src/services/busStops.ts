import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import type { PointFeatureCollection } from '@/models/geoserver'
import { geoApi } from '@/api/config'

const _getStops = async (cqlFilter?: string) => {
  if (!cqlFilter) return []
  const { data }: AxiosResponse<PointFeatureCollection> = await geoApi.get('', {
    params: {
      typeName: 'cite:ft_bus_stop',
      CQL_FILTER: cqlFilter,
    },
  })
  console.log(data)
  return data.features
}

export const getStops = debounce(
  async (cqlFilter?: string) => _getStops(cqlFilter),
  2000,
  {
    leading: true,
    trailing: true,
  },
)
