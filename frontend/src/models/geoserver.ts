type GeometryType = 'Point' | 'LineString'

type GeometryCoordinatesMap = {
  Point: [number, number]
  LineString: [[number, number]]
}

export type Geometry = {
  [K in GeometryType]: {
    type: K
    coordinates: GeometryCoordinatesMap[K]
  }
}[GeometryType]

export type GeoServerFeature<T extends Geometry = Geometry> = {
  type: 'Feature'
  id: string
  geometry: T
  geometry_name: string
  properties: {
    id: number
    name: string
    description: string
    status: string
    sheltered: boolean
  }
}

type GeoServerFeatureCollection<T extends Geometry = Geometry> = {
  type: 'FeatureCollection'
  features: Array<GeoServerFeature<T>>
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

type PointGeometry = Extract<Geometry, { type: 'Point' }>
export type PointFeature = GeoServerFeature<PointGeometry>
export type PointFeatureCollection = GeoServerFeatureCollection<PointGeometry>

type LineStringGeometry = Extract<Geometry, { type: 'Point' }>
export type LineStringFeature = GeoServerFeature<LineStringGeometry>
export type LineStringFeatureCollection =
  GeoServerFeatureCollection<LineStringGeometry>
