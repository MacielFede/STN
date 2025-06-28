import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'
import type { LatLngExpression } from 'leaflet'

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

export const DISTANCE_BETWEEN_STOPS_AND_STREET = 30
export const DISTANCE_BETWEEN_LINE_AND_STREET = 80

export const BASIC_LINE_FEATURE: BusLineFeature = {
  geometry_name: 'LineString',
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [],
  },
  properties: {
    destination: '',
    number: '',
    origin: '',
    description: '',
    status: 'ACTIVE',
    schedule: '09:00:00',
    companyId: 0,
  },
}

export const DEFAULT_MAP_LOCATION: LatLngExpression = [-32.5, -56.164]

export const BUS_LINE_STYLES = (isActive: boolean, isSelected = false) => ({
  color: isSelected ? 'red' : isActive ? 'blue' : 'black',
  weight: 3,
  opacity: 0.8,
})

export const MAX_BUS_STOP_FEATURE_REQUEST = 100
