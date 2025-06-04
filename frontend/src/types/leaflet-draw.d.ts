import * as L from 'leaflet'

declare module 'leaflet' {
  namespace Draw {
    class Feature {
      constructor(map: L.Map, options?: any)
      enable(): void
      disable(): void
      delete(): void
    }

    class Polyline extends Feature {
      constructor(map: L.Map, options?: L.DrawOptions.PolylineOptions)
    }

    class Polygon extends Feature {
      constructor(map: L.Map, options?: L.DrawOptions.PolygonOptions)
    }

    class Rectangle extends Feature {
      constructor(map: L.Map, options?: L.DrawOptions.RectangleOptions)
    }

    class Circle extends Feature {
      constructor(map: L.Map, options?: L.DrawOptions.CircleOptions)
    }

    class Marker extends Feature {
      constructor(map: L.Map, options?: L.DrawOptions.MarkerOptions)
    }

    class CircleMarker extends Feature {
      constructor(map: L.Map, options?: L.DrawOptions.CircleMarkerOptions)
    }

    const Event: {
      CREATED: 'draw:created'
      EDITED: 'draw:edited'
      DELETED: 'draw:deleted'
      DRAWSTART: 'draw:drawstart'
      DRAWSTOP: 'draw:drawstop'
      DRAWVERTEX: 'draw:drawvertex'
      EDITSTART: 'draw:editstart'
      EDITMOVE: 'draw:editmove'
      EDITRESIZE: 'draw:editresize'
      EDITVERTEX: 'draw:editvertex'
      EDITSTOP: 'draw:editstop'
      DELETESTART: 'draw:deletestart'
      DELETESTOP: 'draw:deletestop'
    }
  }

  namespace EditToolbar {
    class Edit {
      constructor(map: L.Map, options: { featureGroup: L.FeatureGroup<any> })
      enable(): void
      disable(): void
    }
  }
}
