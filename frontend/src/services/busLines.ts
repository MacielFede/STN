import type { AxiosResponse } from 'axios'
import type { LineStopRelationship } from '@/models/database'
import type { BusLineFeature, FeatureCollection } from '@/models/geoserver'
import { api, geoApi } from '@/api/config'
import { GEO_WORKSPACE } from '@/utils/constants'

export const getLinesByStopId = async (stopId: number) => {
  const { data: linesInStop }: AxiosResponse<Array<LineStopRelationship>> =
    await api.get(`/stop-lines/by-stop/${stopId}`)

  const { data }: AxiosResponse<FeatureCollection<BusLineFeature>> =
    await geoApi.get('', {
      params: {
        typeName: `${GEO_WORKSPACE}:ft_bus_line`,
        CQL_FILTER: `id IN(${linesInStop.map((rel, index) => (index === linesInStop.length ? `'${rel.lineId},'` : `${rel.lineId}'`))})`,
      },
    })
  return data.features
}
