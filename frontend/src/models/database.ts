import type { PointGeometry } from './geoserver'

export type BusStopProperties = {
  id?: number
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  hasShelter: boolean
  direction: StopDirection
  department: Department
  route: string
}

export type StatusOptions = BusStopProperties['status'] | ''

export type StreetProperties = {
  id?: number
  sourceId: string
  segmentRef: string
  streetCode: string
  name: string
  streetType: string
  source: string
  locality: string
  department: string
}

export type BusLineProperties = {
  id: number
  number: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  origin: string
  destination: string
  companyId: number
  schedule: string
}

export type StopDirection = 'OUTBOUND' | 'INBOUND' | 'BIDIRECTIONAL'

export type Department =
  | 'Artigas'
  | 'Canelones'
  | 'Cerro Largo'
  | 'Colonia'
  | 'Durazno'
  | 'Flores'
  | 'Florida'
  | 'Lavalleja'
  | 'Maldonado'
  | 'Montevideo'
  | 'Paysandú'
  | 'Río Negro'
  | 'Rivera'
  | 'Rocha'
  | 'Salto'
  | 'San José'
  | 'Soriano'
  | 'Tacuarembó'
  | 'Treinta y Tres'

type FilterName =
  | 'company'
  | 'origin-destination'
  | 'schedule'
  | 'polygon'
  | 'street'
  | 'line'
  | 'stopLine'
  | 'status'
  | 'location'

export type FilterData = {
  company: {
    id: number
    name: string
  }
  'origin-destination': {
    origin: string
    destination: string
  }
  schedule: {
    lowerTime: string
    upperTime: string
  }
  polygon: {
    polygonPoints: Array<[number, number]>
  }
  street: {
    streetName: string
    km: string
  }
  line: {
    id: number
    name: string
  }
  stopLine: {
    busStopName: string
  }
  status: {
    lineStatus: StatusOptions
    stopStatus: StatusOptions
  }
  location: {
    userLocation: PointGeometry
  }
}

export type EndUserFilter = {
  [k in FilterName]: {
    name: k
    isActive: boolean
    data?: FilterData[k]
  }
}[FilterName]

export type Company = {
  id: number
  name: string
}

export type LoginTransactionResponse = {
  token: string
}

export type BusStopLine = {
  id: number
  stopId: string
  lineId: number
  estimatedTime: string
  isEnabled: boolean
}
