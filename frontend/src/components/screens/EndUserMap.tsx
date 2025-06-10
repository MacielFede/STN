// React y hooks
import { useState, useCallback, useEffect } from 'react'

// Leaflet
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Toast
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Estilos
import '@/styles/Map.css'

// Hooks
import { useUserLocation } from '@/hooks/useUserLocation'
import { useLinesSearch } from '../../hooks/useLinesSearch'
import useLines from '@/hooks/useLines'

// Tipos
import type { BusStopFeature, BusLineFeature } from '@/models/geoserver'

// Componentes - Atoms
import CommandPallete from '../atoms/CommandPallete'
import { LineDrawer } from '../atoms/LineDrawer'
import { PolygonMarkers } from '../atoms/PolygonMarkers'
import { IntersectingLinesLayer } from '../atoms/IntersectingLinesLayer'
import { PolygonDrawerControl } from '../atoms/PolygonDrawerControl'

// Componentes - Molecules
import BusStops from '../molecules/BusStops'
import CompanySelector from '../molecules/end-user/CompanySelector'
import BusStopTable from '../molecules/end-user/BusStopTable'
import BusLinetable from '../molecules/end-user/BusLineTable'
import ScheduleSelector from '../molecules/end-user/ScheduleSelector'

// UI
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import { Separator } from '../ui/separator'

// Imágenes
import ArrowTop from '../../../public/arrow_top.svg?react'
import ArrowDown from '../../../public/arrow_down.svg?react'

function EndUserMap() {
  const position = useUserLocation()
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const { intersectingLines, searchLines, setIntersectingLines } = useLinesSearch()
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>([])
  const { lines } = useLines()
  const toggleLineVisibility = (lineId: number) => {
    setSelectedLineIds((prev) =>
      prev.includes(lineId)
        ? prev.filter((id) => id !== lineId)
        : [...prev, lineId]
          )
  }

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

  const onSearch = async () => {
    if (polygonPoints.length < 3) return
    await searchLines(polygonPoints)
    setIsOpen(true)
  }

  const onToggleDrawing = () => {
    setIsDrawing(!isDrawing)
    setPolygonPoints([])
    setIntersectingLines([])
    setSelectedLineIds([])
    setIsOpen(false)
  }
  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <ScheduleSelector />
        <CompanySelector />
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
          <GeoJSON key={line.id} data={line} style={{ color: 'red' }} />
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
        <PolygonMarkers isDrawing={isDrawing} polygonPoints={polygonPoints} setPolygonPoints={setPolygonPoints} />
        <IntersectingLinesLayer lines={intersectingLines} selectedLineIds={selectedLineIds} />
      </MapContainer>

      <CommandPallete yPosition="top" xPosition="right">
        <PolygonDrawerControl
          isDrawing={isDrawing}
          polygonPoints={polygonPoints}
          onToggleDrawing={onToggleDrawing}
          onSearch={onSearch}
        />
      </CommandPallete>

      <LineDrawer
        lines={intersectingLines}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        selectedLineIds={selectedLineIds}
        onToggleLine={toggleLineVisibility}
      />

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
