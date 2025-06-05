/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BBox } from '@/models/geoserver'

export const buildBBoxFilter = ({ sw, ne }: BBox) =>
  sw && ne ? `BBOX(geometry, ${sw.lng}, ${sw.lat}, ${ne.lng}, ${ne.lat})` : ''


export const buildCqlFilter = (BBoxFilter: string) => `${BBoxFilter}`

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

export function transformKeysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toCamelCase(key)] = transformKeysToCamelCase(value)
      return acc
    }, {} as any)
  }
  return obj
}

export function turnCapitalizedDepartment(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase()
}
