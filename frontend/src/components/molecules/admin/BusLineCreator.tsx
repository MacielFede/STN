import React, { useEffect, useRef, useState } from 'react'
import { FeatureGroup, useMap } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import {
  FeatureGroup as LeafletFeatureGroup,
  type LatLngLiteral,
  type Polyline,
} from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useBusLineContext } from '@/contexts/BusLineContext'

const BusLineCreator = () => {
  const { featureGroupRef, onCreationRef, onEditedRef, editHandlerRef, newBusLine, setNewBusLine, updateBusLineData } = useBusLineContext();
  const map = useMap();

  const handleCreated = (e: any) => {
    const layer: Polyline = e.layer

    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers()
    }

    featureGroupRef.current?.addLayer(layer)

    const latlngs: any = layer.getLatLngs() as LatLngLiteral[]
    const coords = latlngs.map((latlng: { lng: any; lat: any }) => [latlng.lng, latlng.lat])
    if (!newBusLine?.properties) return;
    updateBusLineData({
      ...newBusLine,
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
    })

    if (map && featureGroupRef.current) {
      const editHandler = new L.EditToolbar.Edit(map, {
        featureGroup: featureGroupRef.current,
      })
      editHandler.enable()
      editHandlerRef.current = editHandler;
      onEditedRef.current = true;
    }
  }

  const handleEdited = (e: any) => {
    e.layers.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline) {
        const latlngs: any = layer.getLatLngs() as LatLngLiteral[]
        const coords = latlngs.map((latlng: { lng: any; lat: any }) => [latlng.lng, latlng.lat])
        if (!newBusLine?.properties) return;
        updateBusLineData({
          ...newBusLine,
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        })
      }
    })
  }

  const handleDeleted = () => {
    setNewBusLine(null)
  }

  useEffect(() => {
    if (!map) return;

    if (onCreationRef.current) return;

    const polylineDrawer = new L.Draw.Polyline(map, {
      shapeOptions: { color: 'blue' },
    })
    polylineDrawer.enable()
    onCreationRef.current = true;
  }, [map])

  useEffect(() => {
    console.log('New bus line updated:', { ...newBusLine })
  }, [newBusLine])

  return (
    <FeatureGroup ref={featureGroupRef}>
      <div style={{display: 'none'}}>
        <EditControl
          position="topleft"
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
          draw={{
            polyline: true,
            polygon: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            featureGroup: featureGroupRef.current!,
            edit: {},
            remove: true,
          }}
        />
      </div >
    </FeatureGroup>
  )
}

export default BusLineCreator
