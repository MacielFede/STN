import type { BusStopProperties, StreetProperties, BusLineProperties } from './database'

type GeometryType = 'Point' | 'LineString' | 'MultiLineString'

type GeometryCoordinatesMap = {
  Point: [number, number]
  LineString: Array<[number, number]>
  MultiLineString: Array<Array<[number, number]>>
}

type Geometry = {
  [K in GeometryType]: {
    type: K
    coordinates: GeometryCoordinatesMap[K]
  }
}[GeometryType]

export type PointGeometry = Extract<Geometry, { type: 'Point' }>
// type LineStringGeometry = Extract<Geometry, { type: 'Point' }>
export type MultiLineStringGeometry = Extract<
  Geometry,
  { type: 'MultiLineString' }
>

export type BusStopFeature = {
  type?: 'Feature'
  id?: string
  geometry: PointGeometry
  geometry_name?: string
  properties: BusStopProperties
}

export type StreetFeature = {
  type?: 'Feature'
  id?: string
  geometry: MultiLineStringGeometry
  geometryName: string
  properties: StreetProperties
}

export type FeatureCollection<T> = {
  type: 'FeatureCollection'
  features: Array<T>
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



export type BusLineFeature = {
  type: 'Feature'
  id: string
  geometry: PointGeometry
  geometry_name: string
  properties: BusLineProperties
}


export type BBox = {
  sw?: L.LatLng
  ne?: L.LatLng
}
