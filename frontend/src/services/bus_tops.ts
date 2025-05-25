import type { AxiosResponse } from 'axios'
import type { PointFeatureCollection } from '@/models/geoserver'
import { geoApi } from '@/api/config'

export const getStops = async () => {
  const { data }: AxiosResponse<PointFeatureCollection> = await geoApi.get('', {
    params: {
      typeName: 'cite:ft_bus_stop',
    },
  })
  console.log(data)
  if (!data.features) throw Error()
  return data.features
}
