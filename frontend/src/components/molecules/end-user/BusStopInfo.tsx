import type { BusStopFeature } from '@/models/geoserver'

const BusStopInfo = ({ stop }: { stop: BusStopFeature }) => {
  return (
    <>
      <h2 className="px-2 font-bold">Parada seleccionada</h2>
      <div className="flex flex-row justify-between align-middle gap-1 w-full p-2 border rounded">
        <div>
          <strong>Nombre:</strong>
          <p>{stop.properties.name}</p>
        </div>
        <div>
          <strong>Descripción:</strong>
          <p>{stop.properties.description}</p>
        </div>
        <div>
          <strong>Estado:</strong>
          <p>
            {stop.properties.status === 'ACTIVE'
              ? 'Habilitada'
              : 'Deshabilitada'}
          </p>
        </div>
        <div>
          <strong>Refugio:</strong>
          <p>{stop.properties.hasShelter ? 'Sí' : 'No'}</p>
        </div>
      </div>
    </>
  )
}

export default BusStopInfo
