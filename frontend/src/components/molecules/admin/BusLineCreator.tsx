import { useEffect, useRef, useState } from 'react'
import { FeatureGroup, Marker, Polyline, useMap, useMapEvents, Tooltip } from 'react-leaflet'
import L, { point } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { getLineFromGraphHopper } from '@/services/busLines'
import type { BusLineFeature, LineStringGeometry } from '@/models/geoserver'
import { useBusLineContext } from '@/contexts/BusLineContext'


const MAX_POINTS = 10

const BusLineCreator = ({
  onChange,
}: {
  onChange?: (coords: [number, number][]) => void
}) => {
  const [points, setPoints] = useState<[number, number][]>([])
  const [mousePos, setMousePos] = useState<[number, number] | null>(null)
  const [finished, setFinished] = useState(false)
  const [calculatedRoute, setCalculatedRoute] = useState<LineStringGeometry | null>(null)
  const [deleteClicks, setDeleteClicks] = useState<{ [idx: number]: number }>({})
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const { newBusLine, setNewBusLine, featureGroupRef } = useBusLineContext();
  const map = useMap()
  const polylineRef = useRef<L.Polyline | null>(null)

  useMapEvents({
    click(e) {
      if (finished || points.length >= MAX_POINTS) return

      // Si hay al menos 2 puntos y el usuario hace click cerca del destino, finalizar
      if (
        points.length > 1 &&
        mousePos &&
        distance(mousePos, points[points.length - 1]) < 0.0002 // ~20m
      ) {
        setFinished(true)
        return
      }

      setPoints(prev => {
        if (prev.length < MAX_POINTS) {
          return [...prev, [e.latlng.lng, e.latlng.lat]]
        }
        return prev
      })
    },
    mousemove(e) {
      setMousePos([e.latlng.lng, e.latlng.lat])
    },
    mouseout() {
      setMousePos(null)
    }
  })

  useEffect(() => {
    if (onChange) onChange(points)
  }, [points, onChange])

  useEffect(() => {
    if (!finished) return

    const calculateRoute = async () => {
      const coordinates = await getLineFromGraphHopper(points.map(p => [p[0], p[1]]))
      setCalculatedRoute(coordinates || null);
      if (coordinates) {
        setNewBusLine((prev) => ({
          ...prev,
          geometry: coordinates,
        }))
      }
    }
    calculateRoute();
  }, [finished])

  useEffect(() => {
    if (!calculatedRoute) return

    const polyline = L.polyline(
      calculatedRoute.coordinates.map(([lng, lat]) => [lat, lng]),
      { color: 'green', weight: 4 }
    )
    polyline.addTo(map)
    map.fitBounds(polyline.getBounds())
    setPoints([]);
    setFinished(false);

    polylineRef.current = polyline;

    return () => {
      map.removeLayer(polyline)
    }

  }, [calculatedRoute])

  useEffect(() => {
    if(!polylineRef.current || newBusLine?.geometry?.coordinates?.length) return;
      
    map.removeLayer(polylineRef.current)
    polylineRef.current = null;
    setCalculatedRoute(null);
  }, [newBusLine])

  useEffect(() => {
    const mapContainer = map.getContainer()
    if (!calculatedRoute) {
      mapContainer.style.cursor = `crosshair`
      return;
    }
    mapContainer.style.cursor = ''
    return () => {
      mapContainer.style.cursor = ''
    }
  }, [map, calculatedRoute])

  const handleReset = () => {
    setPoints([])
    setFinished(false)
    setDeleteClicks({})
  }

  const handleDeletePoint = (idx: number) => {
    setDeleteClicks(prev => {
      const clicks = (prev[idx] || 0) + 1
      if (points.length > 1 && idx === points.length - 1 && clicks === 1) {
        setFinished(true)
        return { ...prev, [idx]: clicks }
      }
      if (clicks >= 2) {
        setPoints(points => points.filter((_, i) => i !== idx))
        setFinished(false)
        const newClicks = { ...prev }
        delete newClicks[idx]
        return newClicks
      }
      return { ...prev, [idx]: clicks }
    })
    setTimeout(() => {
      setDeleteClicks(prev => {
        if (prev[idx] === 1) {
          const newClicks = { ...prev }
          delete newClicks[idx]
          return newClicks
        }
        return prev
      })
    }, 1500)
  }

  const previewLine =
    !finished && points.length > 0 && mousePos && points.length < MAX_POINTS
      ? [...points, mousePos]
      : null

  function distance(a: [number, number], b: [number, number]) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
  }

  return (
    <>
      {!newBusLine?.geometry?.coordinates?.length && (
        <BusLineGuide
          points={points}
          finished={finished}
          maxPoints={MAX_POINTS}
        />
      )}
      {!newBusLine?.geometry?.coordinates?.length && (
        <FeatureGroup>
          {points.map(([lng, lat], idx) => (
            <Marker
              key={idx}
              position={[lat, lng]}
              icon={new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })}
              eventHandlers={{
                click: () => handleDeletePoint(idx),
                mouseover: () => setHoveredIdx(idx),
                mouseout: () => setHoveredIdx(null),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                {idx === 0
                  ? 'Origen (doble clic para borrar)'
                  : idx === points.length - 1
                    ? hoveredIdx === idx
                      ? <span style={{ color: 'green', fontWeight: 600 }}>Finalizar (clic)</span>
                      : 'Destino (clic para finalizar)'
                    : `Intermedio ${idx} (doble clic para borrar)`}
              </Tooltip>
            </Marker>
          ))}
          {points.length > 1 && (
            <Polyline
              positions={points.map(([lng, lat]) => [lat, lng])}
              color="blue"
              weight={4}
            />
          )}
          {previewLine && (
            <Polyline
              positions={previewLine.map(([lng, lat]) => [lat, lng])}
              color="gray"
              weight={2}
              dashArray="6"
            />
          )}
        </FeatureGroup>
      )}
    </>
  )
}

interface BusLineGuideProps {
  points: [number, number][]
  finished: boolean
  maxPoints?: number
}

const BusLineGuide: React.FC<BusLineGuideProps> = ({ points, finished, maxPoints = 10 }) => {
  return (
    <div className="absolute top-2 left-2 z-[1100] bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl shadow-lg max-w-xs text-sm border border-blue-200">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-bold text-base text-blue-800">Guía de creación de línea</span>
      </div>
      <ol className="mb-3 list-decimal list-inside space-y-2 pl-2">
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-green-700">Origen:</span> Haz clic en el mapa para seleccionar el punto de inicio.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-blue-700">Intermedias:</span> Haz clic para agregar hasta <b>{maxPoints - 2}</b> puntos intermedios.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-red-700">Destino:</span> Haz clic en el último punto para finalizar la línea.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-gray-700">Borrar:</span> Doble clic en cualquier marcador para eliminarlo.
          </span>
        </li>
      </ol>
      <div className="mb-2 flex items-center gap-2">
        <span className="font-semibold text-blue-700">Límite:</span>
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">{points.length} / {maxPoints}</span>
        <span className="ml-auto text-xs text-gray-400">puntos</span>
      </div>
      <div className="mb-2">
        <span className="font-semibold text-blue-700">Estado:</span>{' '}
        {points.length === 0 && <span className="text-gray-500">Selecciona el origen</span>}
        {points.length === 1 && <span className="text-blue-700">Selecciona el destino o puntos intermedios</span>}
        {points.length > 1 && !finished && points.length < maxPoints && (
          <span className="text-blue-700">Puedes agregar intermedios o finalizar en el destino</span>
        )}
        {points.length >= maxPoints && !finished && (
          <span className="text-red-700 font-semibold">Máximo de puntos alcanzado</span>
        )}
        {finished && (
          <span className="text-green-700 font-bold">¡Destino marcado! Línea finalizada.</span>
        )}
      </div>
    </div>
  )
}

export default BusLineCreator