import { useCallback, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Drawer, DrawerItems } from 'flowbite-react'
import { Button } from '../ui/button'
import Modal from '../molecules/Modal'
import BusStops from '../molecules/BusStops'
import type { BusStopFeature } from '@/models/geoserver'
import CommandPallete from '@/components/molecules/CommandPallete'
import BusStopForm from '@/components/atoms/BusStopForm'
import CompanyCRUD from '../molecules/CompanyCRUD'

const AdminMap = () => {
  const [, , removeCookie] = useCookies(['admin-jwt'])

  const [isOpen, setIsOpen] = useState(false)
  const [activeStop, setActiveStop] = useState<BusStopFeature | null>(null)

  const handleCloseDrawer = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (activeStop) {
      setIsOpen(true)
    }
  }, [activeStop])

  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <Modal
          type="Companies"
          trigger={
            <Button
              onClick={() => {
                console.log('Administrar empresas de transporte')
              }}
            >
              Administrar empresas
            </Button>
          }
          body={<CompanyCRUD />}
        />
        <Modal
          type="Lines"
          trigger={
            <Button
              onClick={() => console.log('Administrar lineas de transporte')}
            >
              Administrar lineas de transporte
            </Button>
          }
          body={'Hola'}
        />
        <Button
          className="bg-red-800"
          onClick={() => removeCookie('admin-jwt')}
        >
          Sign out
        </Button>
      </CommandPallete>

      <MapContainer
        preferCanvas={false}
        center={[-32.5, -56.164]}
        zoom={8}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BusStops setActiveStop={setActiveStop} />
      </MapContainer>

      <Drawer
        open={isOpen}
        onClose={handleCloseDrawer}
        position="bottom"
        className="z-3000 bg-gray-200"
        backdrop={false}
      >
        <DrawerItems>
          {activeStop && <BusStopForm stop={activeStop} />}
        </DrawerItems>
      </Drawer>
    </>
  )
}

export default AdminMap
