import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import type {
  BusStopFeatureCollection,
  PointGeometry,
} from '@/models/geoserver'
import type { BusStopProperties } from '@/models/database'
import { api, geoApi } from '@/api/config'

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
  return data.features
}

export const getStops = debounce(
  async (cqlFilter: string) => _getStops(cqlFilter),
  1000,
  {
    leading: true,
    trailing: true,
  },
)

export const updateStop = async (
  values: BusStopProperties & { geometry: PointGeometry },
) => {
  return await api.put(`bus-stops/${values.id}`, {
    ...values,
  })
}

export const deleteStop = async (id: number) => {
  return await api.delete(`bus-stops/${id}`)
}
