import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Drawer, DrawerHeader, DrawerItems } from 'flowbite-react'
import { Button } from '../ui/button'
import Modal from '../atoms/Modal'
import BusStops from '../molecules/BusStops'
import NewBusStopComponent from '../molecules/admin/NewBusStop'
import { Separator } from '../ui/separator'
import type { BusStopFeature } from '@/models/geoserver'
import CommandPallete from '@/components/atoms/CommandPallete'
import BusStopForm from '@/components/molecules/admin/BusStopForm'
import CompanyCRUD from '@/components/molecules/admin/CompanyCRUD'
import { BASIC_STOP_FEATURE, DEFAULT_MAP_LOCATION } from '@/utils/constants'

const AdminMap = () => {
  const [, , removeCookie] = useCookies(['admin-jwt'])
  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)

  const handleCloseDrawer = useCallback(() => {
    setIsOpen(false)
    setActiveStop(null)
  }, [])

  useEffect(() => {
    if (activeStop) setIsOpen(true)
    else setIsOpen(false)
  }, [activeStop])

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <Modal
          type="Companies"
          trigger={<Button>Administrar empresas</Button>}
          body={<CompanyCRUD />}
        />
        <Button onClick={() => setActiveStop(BASIC_STOP_FEATURE)}>
          Crear parada de omnibus
        </Button>
        <Button
          className="bg-red-800"
          onClick={() => removeCookie('admin-jwt')}
        >
          Sign out
        </Button>
      </CommandPallete>

      <MapContainer
        preferCanvas={false}
        center={DEFAULT_MAP_LOCATION}
        zoom={8}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BusStops setActiveStop={setActiveStop} />
        {activeStop && !activeStop.id && (
          <NewBusStopComponent
            setNewStop={setActiveStop}
            newStopGeom={activeStop.geometry}
          />
        )}
      </MapContainer>

      <Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        className="z-3000 bg-gray-200 max-h-50"
        backdrop={false}
      >
        <DrawerHeader title="STN | Ver información de paradas y recorridos seleccionados" />
        <DrawerItems>
          {activeStop && (
            <>
              <BusStopForm
                stop={activeStop}
                setStop={setActiveStop}
                resetActiveStop={() => setActiveStop(null)}
              />
              <Separator className="my-4 bg-black" decorative />
            </>
          )}
        </DrawerItems>
      </Drawer>
    </>
  )
}

export default AdminMap
