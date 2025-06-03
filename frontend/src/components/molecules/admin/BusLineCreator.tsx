import React, { useState } from 'react'
import { Polyline, useMapEvents } from 'react-leaflet'
import * as turf from '@turf/turf'
import type { LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { BusLineFeature } from '@/models/geoserver'

const BusLineCreator = ({
  newLine,
  setNewLine,
}: {
  newLine: BusLineFeature
  setNewLine: React.Dispatch<React.SetStateAction<BusLineFeature | null>>
}) => {
  const [points, setPoints] = useState<Array<LatLng>>([])
  useMapEvents({
    click(e) {
      addPoint(e.latlng)
    },
  })

  const clear = () => {
    setPoints([])
  }

  const addPoint = (latlng: LatLng) => {
    setPoints((prev) => [...prev, latlng])

    if (points.length > 1) {
      setNewLine({
        ...newLine,
        geometry: {
          type: 'LineString',
          coordinates: points.map((pt) => [pt.lng, pt.lat]),
        },
      })
    }
  }

  return points.length > 1 && <Polyline positions={points} color="blue" />
}
export default BusLineCreator
