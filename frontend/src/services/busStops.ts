import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import type { BusStopFeatureCollection } from '@/models/geoserver'
import { geoApi } from '@/api/config'

const _getStops = async (cqlFilter: string) => {
  const { data }: AxiosResponse<BusStopFeatureCollection> = await geoApi.get(
    '',
    {
      params: {
        typeName: 'cite:ft_bus_stop',
        CQL_FILTER: cqlFilter,
      },
    },
  )
  console.log(data)
  return data.features
}

export const getStops = debounce(
  async (cqlFilter: string) => _getStops(cqlFilter),
  2000,
  {
    leading: true,
    trailing: true,
  },
)
