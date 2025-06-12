import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'

export const GEO_WORKSPACE = 'ne'

export const ADMIN_PATHNAME = '/admin'

export const DEFAULT_COORDINATES: [number, number] = [-56.163, -32.5]

export const BASIC_STOP_FEATURE: BusStopFeature = {
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: DEFAULT_COORDINATES,
  },
  properties: {
    name: 'Nueva parada',
    description: 'Direccion de la parada',
    status: 'INACTIVE',
    hasShelter: false,
    department: 'Montevideo',
    direction: 'BIDIRECTIONAL',
    route: 'AV. Italia',
  },
}

export const DISTANCE_BETWEEN_STOPS_AND_STREET = 10

export const BASIC_LINE_FEATURE: BusLineFeature = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [],
  },
  properties: {
    destination: 'Canelones',
    number: 'L29',
    origin: 'Montevideo',
    status: 'ACTIVE',
    schedule: '09:00:00',
    companyId: null,
  },
}
