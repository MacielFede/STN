import type { BusStopFeature } from '@/models/geoserver'

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
    status: 'ACTIVE',
    hasShelter: false,
    department: 'Montevideo',
    direction: 'BIDIRECTIONAL',
    route: 'AV. Italia',
  },
}

export const DISTANCE_BETWEEN_STOPS_AND_STREET = 20
