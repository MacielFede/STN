import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import type {
  BusStopFeature,
  FeatureCollection,
  PointGeometry,
  StreetFeature,
} from '@/models/geoserver'
import type { BusStopProperties } from '@/models/database'
import { api, geoApi } from '@/api/config'
import {
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'

const _getStops = async (cqlFilter: string) => {
  const { data }: AxiosResponse<FeatureCollection<BusStopFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_stop`,
        CQL_FILTER: cqlFilter,
      },
    })
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

export const streetStopContext = async ({
  lon,
  lat,
}: {
  lon: number
  lat: number
}) => {
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: `DWITHIN(geom, POINT(${lon} ${lat}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`,
      },
    })

  return data.features.length > 0 ? data.features[0] : null
}
