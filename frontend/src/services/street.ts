import type {
  FeatureCollection,
  KmFeature,
  StreetFeature,
} from '@/models/geoserver'
import type { AxiosResponse } from 'axios'
import { geoApi } from '@/api/config'
import {
  DISTANCE_BETWEEN_LINE_AND_STREET,
  DISTANCE_BETWEEN_STOPS_AND_STREET,
  GEO_WORKSPACE,
} from '@/utils/constants'

export const streetContext = async ({
  lon,
  lat,
  isStop = false,
}: {
  lon: number
  lat: number
  isStop?: boolean
}) => {
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: `DWITHIN(geom, POINT(${lat} ${lon}), ${isStop ? DISTANCE_BETWEEN_STOPS_AND_STREET : DISTANCE_BETWEEN_LINE_AND_STREET}, meters)`,
      },
    })

  return data.features.length > 0 ? data.features[0] : null
}

export const findStreet = async (streetName: string) => {
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: `name ILIKE '%${streetName}%'`,
      },
    })
  return data.features
}

export const findKilometerPost = async (
  streetName: string,
  kilometer: string,
) => {
  const { data }: AxiosResponse<FeatureCollection<KmFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_kilometer_post`,
        CQL_FILTER: `route_name='${streetName}' AND kilometer='${kilometer}'`,
      },
    })
  return data.features[0]
}
