import type { FeatureCollection, StreetFeature } from '@/models/geoserver'
import type { AxiosResponse } from 'axios'
import { geoApi } from '@/api/config'
import {
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'

export const streetContext = async ({
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

export const findStreet = async (streetName: string) => {
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: `name ILIKE '%${streetName.toUpperCase()}%'`,
      },
    })

  return data.features
}
