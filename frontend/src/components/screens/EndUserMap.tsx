import L from 'leaflet'
import { useEffect, useState } from 'react'
import { GeoJSON, MapContainer, Marker, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'react-toastify/dist/ReactToastify.css'
import '@/styles/Map.css'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import OriginDestinationSelector from '../molecules/end-user/OriginDestinationSelector'
import CommandPallete from '../atoms/CommandPallete'
import BusStops from '../molecules/BusStops'
import CompanySelector from '../molecules/end-user/CompanySelector'
import BusStopTable from '../molecules/end-user/BusStopTable'
import BusLinetable from '../molecules/end-user/BusLineTable'
import ScheduleSelector from '../molecules/end-user/ScheduleSelector'
import PolygonSelector from '../molecules/end-user/PolygonSelector'
import { Separator } from '../ui/separator'
import ArrowTop from '../../../public/arrow_top.svg?react'
import ArrowDown from '../../../public/arrow_down.svg?react'
import { PolygonFilterUtilities } from '../atoms/PolygonFilterUtilities'
import StreetSelector from '../molecules/end-user/StreetSelector'
import UserPositionIndicator from '../atoms/UserPositionIndicator'
import StatusSelector from '../molecules/end-user/StatusSelector'
import DefaultLinesSelector from '../molecules/end-user/DefaultLinesSelector'
import KmPost from '../../../public/km_post_icon.png'
import type { BusLineFeature, BusStopFeature } from '@/models/geoserver'
import useLines from '@/hooks/useLines'
import { BUS_LINE_STYLES, DEFAULT_MAP_LOCATION } from '@/utils/constants'
import { useGeoContext } from '@/contexts/GeoContext'

const kmPostIcon = L.icon({
  iconUrl: KmPost,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

function EndUserMap() {
  const [polygonPoints, setPolygonPoints] = useState<Array<[number, number]>>(
    [],
  )
  const [isDrawing, setIsDrawing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)
  const [displayedRoutes, setDisplayedRoutes] = useState<Array<BusLineFeature>>(
    [],
  )
  const [selectedRouteId, setSelectedRouteId] = useState<string>('')
  const { lines } = useLines()
  const { kmFeature } = useGeoContext()

  function handleDisplayRoute(route: BusLineFeature) {
    setDisplayedRoutes((prev) => {
      const exists = prev.some((r) => r.id === route.id)
      if (exists) {
        if (selectedRouteId === route.id) setSelectedRouteId('')
        return prev.filter((r) => r.id !== route.id)
      } else {
        return [...prev, route]
      }
    })
  }
  const handleCloseDrawer = () => {
    setIsOpen(false)
    setActiveStop(null)
  }

  useEffect(() => {
    setDisplayedRoutes(lines)
  }, [lines])

  useEffect(() => {
    if (activeStop || lines.length) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop, lines])

  const onToggleDrawing = () => {
    setIsDrawing(!isDrawing)
    setPolygonPoints([])
    setIsOpen(false)
  }

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right" displayToogle>
        <StreetSelector />
        <OriginDestinationSelector />
        <StatusSelector />
        <ScheduleSelector />
        <CompanySelector />
        <PolygonSelector
          isDrawing={isDrawing}
          polygonPoints={polygonPoints}
          onToggleDrawing={onToggleDrawing}
        />
        <DefaultLinesSelector />
      </CommandPallete>
      <MapContainer
        preferCanvas
        center={DEFAULT_MAP_LOCATION}
        zoom={8}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <BusStops setActiveStop={setActiveStop} activeStop={activeStop} />
        {displayedRoutes.map((line) => (
          <GeoJSON
            key={line.id}
            data={line}
            style={BUS_LINE_STYLES(
              line.properties.status === 'ACTIVE',
              selectedRouteId === line.id,
            )}
            eventHandlers={{
              click: () => {
                if (selectedRouteId === line.id) setSelectedRouteId('')
                else setSelectedRouteId(line.id ?? '')
              },
            }}
          />
        ))}
        {kmFeature && (
          <Marker
            position={[
              kmFeature.geometry.coordinates[1],
              kmFeature.geometry.coordinates[0],
            ]}
            title={`Km ${kmFeature.properties.kilometer}`}
            icon={kmPostIcon}
          />
        )}
        <UserPositionIndicator />
        <PolygonFilterUtilities
          isDrawing={isDrawing}
          polygonPoints={polygonPoints}
          setPolygonPoints={setPolygonPoints}
        />
      </MapContainer>

      <Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        className="z-3000 bg-gray-200 p-0"
        edge
      >
        <DrawerHeader
          title="STN | Ver información de paradas y recorridos seleccionados"
          titleIcon={isOpen ? ArrowDown : ArrowTop}
          onClick={() => setIsOpen(!isOpen)}
          closeIcon={activeStop ? undefined : isOpen ? ArrowDown : ArrowTop}
          className="cursor-pointer px-4 pt-4 mb-1 hover:bg-gray-50 dark:hover:bg-gray-700"
        />
        <DrawerItems className=" max-h-50 ">
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
            selectedRouteId={selectedRouteId}
          />
        </DrawerItems>
      </Drawer>
    </>
  )
}

export default EndUserMap
