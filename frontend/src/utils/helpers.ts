import type { BBox } from '@/models/geoserver'

export const buildBBoxFilter = ({ sw, ne }: BBox) =>
  sw && ne ? `BBOX(geom, ${sw.lng}, ${sw.lat}, ${ne.lng}, ${ne.lat})` : ''

export const buildCqlFilter = (BBoxFilter: string) => `${BBoxFilter}`
