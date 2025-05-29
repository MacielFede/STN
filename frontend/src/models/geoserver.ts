import type { BusStopProperties, BusLineProperties } from './database'

type GeometryType = 'Point' | 'LineString'

type GeometryCoordinatesMap = {
  Point: [number, number]
  LineString: [[number, number]]
}

type Geometry = {
  [K in GeometryType]: {
    type: K
    coordinates: GeometryCoordinatesMap[K]
  }
}[GeometryType]

export type PointGeometry = Extract<Geometry, { type: 'Point' }>

// type LineStringGeometry = Extract<Geometry, { type: 'Point' }>

export type BusStopFeature = {
  type: 'Feature'
  id: string
  geometry: PointGeometry
  geometry_name: string
  properties: BusStopProperties
}

export type BusStopFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<BusStopFeature>
  totalFeatures: number
  numberMatched: number
  numberReturned: number
  timeStamp: string
  crs: {
    type: 'name'
    properties: {
      name: string
    }
  }
}

export type BusLineFeature = {
  type: 'Feature'
  id: string
  geometry: PointGeometry
  geometry_name: string
  properties: BusLineProperties
}


export type BusLineFeatureCollection = {
  type: 'FeatureCollection'
  features: Array<BusLineFeature>
  totalFeatures: number
  numberMatched: number
  numberReturned: number
  timeStamp: string
  crs: {
    type: 'name'
    properties: {
      name: string
    }
  }
}

export type BBox = {
  sw?: L.LatLng
  ne?: L.LatLng
}
