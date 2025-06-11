import { useState, useEffect } from 'react'

import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import 'react-toastify/dist/ReactToastify.css'

import '@/styles/Map.css'

import { useUserLocation } from '@/hooks/useUserLocation'
import useLines from '@/hooks/useLines'

import type { BusStopFeature, BusLineFeature } from '@/models/geoserver'

import CommandPallete from '../atoms/CommandPallete'

import BusStops from '../molecules/BusStops'
import CompanySelector from '../molecules/end-user/CompanySelector'
import BusStopTable from '../molecules/end-user/BusStopTable'
import BusLinetable from '../molecules/end-user/BusLineTable'
import ScheduleSelector from '../molecules/end-user/ScheduleSelector'
import PolygonSelector from '../molecules/end-user/PolygonSelector'

import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import { Separator } from '../ui/separator'

import ArrowTop from '../../../public/arrow_top.svg?react'
import ArrowDown from '../../../public/arrow_down.svg?react'
import { PolygonFilterUtilities } from '../atoms/PolygonFilterUtilities'
import { useGeoContext } from '@/contexts/GeoContext'


function EndUserMap() {
  const position = useUserLocation()
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>([])
  const { lines } = useLines()


  function handleDisplayRoute(route: BusLineFeature) {
    setDisplayedRoutes((prev) => {
      const exists = prev.some((r) => r.id === route.id)
      if (exists) {
        // Quitarla
        return prev.filter((r) => r.id !== route.id)
      } else {
        // Agregarla
        return [...prev, route]
      }
    })
  }
  const handleCloseDrawer = () => {
    setIsOpen(false)
    setActiveStop(null)
  }

  useEffect(() => {
    setDisplayedRoutes([])
  }, [lines])

  useEffect(() => {
    if (activeStop || lines?.length) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop, lines])
    const { toogleEndUserFilter, endUserFilters } = useGeoContext()

  const onSearch = async () => {
    if (polygonPoints.length < 3) return
    toogleEndUserFilter({
      name: 'polygon',
      isActive: true,
      data: {
        polygonPoints: polygonPoints,
      },
    })
    setIsOpen(true)
  }

  const onToggleDrawing = () => {
    setIsDrawing(!isDrawing)
    setPolygonPoints([])
    setIsOpen(false)
  }
  const geoJsonStyle = {
    color: 'pink',
    weight: 3,
    opacity: 0.8,
  }

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <ScheduleSelector />
        <CompanySelector />
        <PolygonSelector
          isDrawing={isDrawing}
          polygonPoints={polygonPoints}
          onToggleDrawing={onToggleDrawing}
          onSearch={onSearch}
        />
        
      </CommandPallete>
      <MapContainer
        preferCanvas
        center={position}
        zoom={13}
        className="leaflet-container"
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <BusStops setActiveStop={setActiveStop} />
        {displayedRoutes.map((line) => (
          <GeoJSON key={line.id} data={line} style={geoJsonStyle} />
        ))}
        <CircleMarker
          center={position}
          radius={80}
          pathOptions={{
            color: 'skyblue',
            fillColor: 'skyblue',
            fillOpacity: 0.2,
          }}
        >
          <Popup>Estás aquí</Popup>
        </CircleMarker>
        <PolygonFilterUtilities isDrawing={isDrawing} polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} />
        
      </MapContainer>

      {((lines && lines.length > 0) || activeStop) && (
        <Drawer
          open={isOpen}
          onClose={handleCloseDrawer}
          position="bottom"
          className="z-3000 bg-gray-200 max-h-50 p-0"
          edge
        >
          <DrawerHeader
            title="STN | Ver información de paradas y recorridos seleccionados"
            titleIcon={isOpen ? ArrowDown : ArrowTop}
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer px-4 pt-4 mb-1 hover:bg-gray-50 dark:hover:bg-gray-700"
          />
          <DrawerItems>
            {activeStop && (
              <>
                <BusStopTable stop={activeStop} />
                <Separator className="my-4 bg-black" decorative />
              </>
            )}
            <BusLinetable
              onDisplayRoute={handleDisplayRoute}
              displayedRoutes={displayedRoutes}
              activeStopId={activeStop?.properties.id}
            />
          </DrawerItems>
        </Drawer>
      )}
    </>
  )
}

export default EndUserMap
