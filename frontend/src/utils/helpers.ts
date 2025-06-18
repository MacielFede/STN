import type { EndUserFilter, FilterData } from '@/models/database'
import type { BBox } from '@/models/geoserver'

export const buildBBoxFilter = ({ sw, ne }: BBox) =>
  sw && ne ? `BBOX(geometry, ${sw.lng}, ${sw.lat}, ${ne.lng}, ${ne.lat})` : ''

export const buildCqlFilter = (filters: Array<string>) => {
  return filters.length > 1
    ? filters.join(' AND ')
    : filters.length === 1
      ? filters[0]
      : ''
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

export function transformKeysToCamelCase<T>(obj: T): unknown {
  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        ;(acc as { [key: string]: unknown })[toCamelCase(key)] =
          transformKeysToCamelCase(value)
        return acc
      },
      {} as { [key: string]: unknown },
    )
  }
  return obj
}

export function turnCapitalizedDepartment(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase()
}

type HalfEndUserFilter = Omit<EndUserFilter, 'isActive'>

function latLngsToWktPolygon(points: Array<[number, number]>): string {
  const coords = points.map(([lat, lng]) => `${lng} ${lat}`).join(', ')
  const [firstLat, firstLng] = points[0]
  return `POLYGON((${coords}, ${firstLng} ${firstLat}))`
}

export function getCqlFilterFromData({ name, data }: HalfEndUserFilter) {
  switch (name) {
    case 'company':
      return `company_id=${(data as FilterData['company']).id}`
    case 'schedule': {
      const schedule = data as FilterData['schedule']
      return schedule.upperTime
        ? `schedule BETWEEN '${schedule.lowerTime}' AND '${schedule.upperTime}'`
        : `schedule = '${schedule.lowerTime}'`
    }

    case 'polygon': {
      const polygon = data as FilterData['polygon']
      const wktPolygon = latLngsToWktPolygon(polygon.polygonPoints)
      return `INTERSECTS(geometry, ${wktPolygon})`
    }

    case 'origin-destination': {
      const { origin, destination } = data as FilterData['origin-destination']
      const originFilter = origin ? `origin='${origin}'` : ''
      const destinationFilter = destination
        ? `destination='${destination}'`
        : ''
      return [originFilter, destinationFilter].filter(Boolean).join(' AND ')
    }

    case 'street': // No puede ir por aca este filtro
    default:
      return ''
  }
}

export function getHoursAndMinutes(isoString: string): string {
  const date = new Date(isoString)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format')
  }

  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

export function toCQLTime(time: string): string {
  // Add ":00" if only HH:MM is provided
  return time.length === 5 ? `${time}:00` : time
}
