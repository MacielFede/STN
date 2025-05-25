import type { BBox } from '@/models/geoserver'

export const buildBBoxFilter = ({ sw, ne }: BBox) =>
  sw && ne ? `BBOX(geom, ${sw.lat}, ${sw.lng}, ${ne.lat}, ${ne.lng})` : ''

export const buildCqlFilter = (BBoxFilter: string) => `${BBoxFilter}`
