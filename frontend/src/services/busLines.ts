import debounce from 'lodash.debounce'
import type { AxiosResponse } from 'axios'
import { api, geoApi } from '@/api/config'
import type { BusLineProperties } from "../models/database"
import type { BusLineFeatureCollection , BusLineFeature } from "../models/geoserver"





const _getLines = async () => {
  const { data }: AxiosResponse<BusLineFeatureCollection> = await geoApi.get(
    '',
    {
      params: {
        typeName: 'cite:ft_bus_line'
        
      },
    },
  )
  return data.features
}

export const getLines = debounce(
  async () => _getLines(),
  1000,
  {
    leading: true,
    trailing: true,
  },
)



