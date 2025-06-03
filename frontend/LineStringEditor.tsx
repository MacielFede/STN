import { FeatureGroup, MapContainer, TileLayer } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import type {
  GeoJSON,
  LatLngLiteral,
  Layer,
  FeatureGroup as LeafletFeatureGroup,
} from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useEffect, useRef, useState } from 'react'

type LineString = {
  type: 'LineString'
  coordinates: Array<[number, number]>
}

const initialLineString: LineString = {
  type: 'LineString',
  coordinates: [
    [-56.190643, -34.901113],
    [-56.186112, -34.903539],
    [-56.181065, -34.905722],
  ],
}

export default function LineStringEditor() {
  const featureGroupRef = useRef<LeafletFeatureGroup>(null)
  const [ready, setReady] = useState(false)

  // Cargar LineString una vez que el FeatureGroup está montado
  useEffect(() => {
    if (featureGroupRef.current && !ready) {
      const geoJsonLayer: GeoJSON = L.geoJSON(
        initialLineString as GeoJSON.GeoJsonObject,
        {
          onEachFeature: (_feature, layer) => {
            featureGroupRef.current?.addLayer(layer)
          },
        },
      )
      setReady(true)
    }
  }, [ready])

  const handleEdit = (e: any) => {
    e.layers.eachLayer((layer: Layer) => {
      if ('getLatLngs' in layer) {
        const latlngs: Array<LatLngLiteral> = (layer as any).getLatLngs()
        const newCoords: Array<[number, number]> = latlngs.map(
          (latlng: LatLngLiteral) => [latlng.lng, latlng.lat],
        )
        const updatedLineString: LineString = {
          type: 'LineString',
          coordinates: newCoords,
        }
        console.log('Nuevo recorrido editado:', updatedLineString)
      }
    })
  }

  console.log(ready)

  return (
    <MapContainer
      center={[-34.9, -56.18]}
      zoom={14}
      // style={{ height: '500px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FeatureGroup ref={featureGroupRef}>
        {/* Solo renderiza EditControl si el ref está listo */}

        <EditControl
          position="topright"
          draw={{
            polyline: false,
            polygon: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            featureGroup: featureGroupRef,
            edit: true,
            remove: false,
          }}
          onEdited={handleEdit}
        />
      </FeatureGroup>
    </MapContainer>
  )
}
