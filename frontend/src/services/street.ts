import type { FeatureCollection, StreetFeature } from '@/models/geoserver'
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

export const findStreet = async (
  streetName: string,
  streetDepartment?: string,
) => {
  const { data }: AxiosResponse<FeatureCollection<StreetFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_street`,
        CQL_FILTER: streetDepartment
          ? `name LIKE '%${streetName.toUpperCase()}%' AND department='${streetDepartment.toUpperCase()}'`
          : `name LIKE '%${streetName.toUpperCase()}%'`,
      },
    })
  return data.features
}
