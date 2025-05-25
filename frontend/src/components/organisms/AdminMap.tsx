import { useCookies } from 'react-cookie'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Button } from '../ui/button'
import Modal from '../molecules/Modal'
import BusStops from '../molecules/BusStops'
import CommandPallete from '@/components/molecules/CommandPallete'

const AdminMap = () => {
  const [, , removeCookie] = useCookies(['admin-jwt'])
  return (
    <>
      <CommandPallete yPosition="top" xPosition="right">
        <Modal
          type="Companies"
          trigger={
            <Button
              onClick={() => {
                console.log('Adminisitrar empresas de transporte')
              }}
            >
              Administrar empresas
            </Button>
          }
          body={'Hola'}
        />
        <Modal
          type="Lines"
          trigger={
            <Button
              onClick={() => console.log('Adminisitrar lineas de transporte')}
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
        <BusStops isAdmin />
      </MapContainer>
    </>
  )
}

export default AdminMap
