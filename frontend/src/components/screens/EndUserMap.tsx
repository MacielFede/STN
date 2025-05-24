import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../../styles/Map.css'

function EndUserMap() {
  return (
    <MapContainer
      preferCanvas={true}
      center={[-32.5, -56.164]}
      zoom={8}
      scrollWheelZoom
    >
      <TileLayer
        url="https://geoweb.montevideo.gub.uy/geonetwork/srv/spa/catalog.search#/metadata/c6ea0476-9804-424a-9fae-2ac8ce2eee31"
        crossOrigin
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}

export default EndUserMap
