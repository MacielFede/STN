import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import type {
  BusStopFeature,
  FeatureCollection,
  PointGeometry,
} from '@/models/geoserver'
import type { BusStopProperties } from '@/models/database'
import { api, geoApi } from '@/api/config'
import { GEO_WORKSPACE } from '@/utils/constants'

export const _getStops = async (cqlFilter: string) => {
  const { data }: AxiosResponse<FeatureCollection<BusStopFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_stop`,
        CQL_FILTER: cqlFilter,
      },
    })
  return data.features
}

export const getStopGeoServer = async (id: number) => {
  const { data }: AxiosResponse<FeatureCollection<BusStopFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_stop`,
        CQL_FILTER: `id = ${id}`,
      },
    })
  return data.features[0]
}

export const getStops = debounce(
  async (cqlFilter: string) => _getStops(cqlFilter),
  1000,
  {
    leading: true,
    trailing: true,
  },
)

export const createStop = async (
  values: BusStopProperties & { geometry: PointGeometry },
) => {
  return await api.post('/bus-stops', {
    ...values,
  })
}

export const updateStop = async (
  values: BusStopProperties & { geometry: PointGeometry },
) => {
  return await api.put(`/bus-stops/${values.id}`, {
    ...values,
  })
}

export const deleteStop = async (id: number) => {
  return await api.delete(`/bus-stops/${id}`)
}
