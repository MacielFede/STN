import type { AxiosResponse } from 'axios'
import type { PointFeatureCollection } from '@/models/geoserver'
import { geoApi } from '@/api/config'

export const getStops = async () => {
  const { data }: AxiosResponse<PointFeatureCollection> = await geoApi.get('', {
    params: {
      typeName: 'citeows:ft_bus_stop',
    },
  })
  console.log(data)
  return data.features
}
