import { useCallback, useEffect, useRef } from 'react'
import { FeatureGroup, Marker, Polyline, useMap, useMapEvents, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { getLineFromGraphHopper } from '@/services/busLines'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { Button } from 'flowbite-react'
import { toast } from 'react-toastify'

const BusLineCreator = () => {
  const {
    calculatedRoute,
    setCalculatedRoute,
    mode,
    setMode,
    handleReset,
    points,
    setPoints,
    updatePointsFromDraw,
    setHoveredIdx,
    addPoint,
    mousePos,
    setMousePos,
    newBusLine,
    busLineStep,
    handleDeletePoint,
    handleFinished,
    MAX_POINTS,
    polylineRef,
    featureGroupRef,
    drawControlRef,
    updateBusLineData,
    errorPoints,
    showLoader,
    hideLoader,
  } = useBusLineContext();

  const map = useMap();

  const localDrawControlRef = useRef<any>(null);

  useEffect(() => {
    if ((mode === 'finished' || !busLineStep) && drawControlRef.current) {
      map.removeControl(drawControlRef.current);
    }
  }, [busLineStep, mode, newBusLine, map]);

  useEffect(() => {
    return () => {
      if (localDrawControlRef.current && map) {
        try {
          map.removeControl(localDrawControlRef.current);
          localDrawControlRef.current = null;
        } catch (error) {
          console.warn('Draw control cleanup error:', error);
        }
      }
    };
  }, []);

  const clearAllMapLayers = useCallback(() => {
    if (polylineRef.current) {
      if (polylineRef.current._map) map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
      drawControlRef.current = null;
    }
  }, [map, polylineRef, featureGroupRef, drawControlRef]);

  // HANDLE EDIT MODE
  useEffect(() => {
    if (mode !== 'editing' || !map || !featureGroupRef.current || points.length < 2) return;

    featureGroupRef.current.clearLayers();

    const leafletPolyline = L.polyline(
      points.map(([lng, lat]) => [lat, lng]),
      { color: 'blue', weight: 4 }
    );
    featureGroupRef.current.addLayer(leafletPolyline);

    if (localDrawControlRef.current) {
      map.removeControl(localDrawControlRef.current);
      localDrawControlRef.current = null;
    }
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current);
    }

    drawControlRef.current = new L.Control.Draw({
      edit: {
        featureGroup: featureGroupRef.current,
        edit: {},
        remove: false,
      },
      draw: false,
    });

    localDrawControlRef.current = drawControlRef.current;

    map.addControl(drawControlRef.current);
    drawControlRef.current._toolbars.edit._modes.edit.handler.enable();

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const onEdited = (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        if (layer instanceof L.Polyline) {
          const latlngs = layer.getLatLngs();
          updatePointsFromDraw(
            latlngs.map((latlng: L.LatLng) => [latlng.lng, latlng.lat])
          );
        }
      });
      setMode('drawing');
      map.removeControl(drawControlRef.current!);
      localDrawControlRef.current = null;
    };

    map.on(L.Draw.Event.EDITED, onEdited);

    return () => {
      map.off(L.Draw.Event.EDITED, onEdited);
      if (localDrawControlRef.current) {
        map.removeControl(localDrawControlRef.current);
        localDrawControlRef.current = null;
      }
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
    };
  }, [mode, map, points, updatePointsFromDraw, setMode]);

  useMapEvents({
    click(e) {
      if (mode === 'drawing') addPoint(e.latlng.lng, e.latlng.lat);
    },
    mousemove(e) {
      setMousePos([e.latlng.lng, e.latlng.lat]);
    },
    mouseout() {
      setMousePos(null);
    }
  });

  // HANDLE FINISHED MODE
  useEffect(() => {
    if (mode !== 'finished') return;

    showLoader();

    let newPoints = points;
    if (featureGroupRef.current) {
      const layers = featureGroupRef.current.getLayers();
      if (layers.length) {
        const polyline = layers[0] as L.Polyline;
        const latlngs = polyline.getLatLngs() as L.LatLng[];
        newPoints = latlngs.map((latlng: L.LatLng) => [latlng.lng, latlng.lat]);

        if (JSON.stringify(points) !== JSON.stringify(newPoints)) {
          setPoints(newPoints);
        }
      }
    }

    clearAllMapLayers();

    if (newBusLine?.geometry?.coordinates?.length) {
      updateBusLineData({
        ...newBusLine,
        geometry: {
          type: 'LineString',
          coordinates: newPoints.map(([lng, lat]) => [lng, lat]),
        },
      });
      hideLoader(1500);
      return;
    }

    const calculateRoute = async () => {
      await handleFinished();
      const coordinates = await getLineFromGraphHopper(points.map(p => [p[0], p[1]]));
      if (!coordinates) {
        toast.error('No se pudo calcular la ruta. Por favor, inténtalo de nuevo.');
        hideLoader(1500);
        setMode('drawing');
        handleReset();
        return;
      }
      setCalculatedRoute(coordinates || null);
      if (coordinates) {
        updateBusLineData({
          ...newBusLine,
          geometry: coordinates,
        });
        setPoints(coordinates.coordinates.map(([lng, lat]) => [lng, lat]));
      }
      hideLoader(1500);
    };
    try {
      calculateRoute();
    } catch (error) {
      toast.error('Error al calcular la ruta. Por favor, inténtalo de nuevo.')
      hideLoader(1500);
    }
  }, [mode]);

  useEffect(() => {
    const mapContainer = map.getContainer();
    if (busLineStep === 'creation' && points.length < MAX_POINTS && !newBusLine?.geometry?.coordinates?.length) {
      mapContainer.style.cursor = `crosshair`;
      return;
    }
    mapContainer.style.cursor = '';
    return () => {
      mapContainer.style.cursor = '';
    };
  }, [map, calculatedRoute, busLineStep]);

  const previewLine =
    mode === 'drawing' && points.length > 0 && mousePos && points.length < MAX_POINTS
      ? [...points, mousePos]
      : null;

  return (
    <>
      <BusLineGuide
        points={points}
        mode={mode}
        handleReset={handleReset}
        maxPoints={MAX_POINTS}
      />
      <FeatureGroup ref={featureGroupRef} />
      <FeatureGroup>
        {mode === 'drawing' && points.map(([lng, lat], idx) => (
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
                  ? 'Destino (doble clic para borrar)'
                  : `Intermedio ${idx} (doble clic para borrar)`}
            </Tooltip>
          </Marker>
        ))}

        {points.length > 1 && mode === 'drawing' && (
          <Polyline
            positions={points.map(([lng, lat]) => [lat, lng])}
            color="blue"
            weight={4}
          />
        )}

        {previewLine && mode === 'drawing' && (
          <Polyline
            positions={previewLine.map(([lng, lat]) => [lat, lng])}
            color="gray"
            weight={2}
            dashArray="6"
          />
        )}

        {points.length > 1 && (
          <Polyline
            positions={points.map(([lng, lat]) => [lat, lng])}
            color="green"
            weight={4}
          />
        )}
        {errorPoints?.length > 0 && (
          <Polyline
            positions={errorPoints.map(([lng, lat]) => [lat, lng])}
            color="red"
            weight={4}
            dashArray="6"
          />
        )}
      </FeatureGroup>
    </>
  );
};

interface BusLineGuideProps {
  points: [number, number][]
  mode: string
  handleReset: () => void
  maxPoints?: number
}

const BusLineGuide: React.FC<BusLineGuideProps> = ({ points, mode, handleReset, maxPoints = 10 }) => {
  const {
    newBusLine,
    busLineStep,
  } = useBusLineContext();
  const finished = mode === 'finished';

  if (busLineStep === "select-intermediate") {
    return (
      <div className="absolute top-2 left-2 z-[1100] bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl shadow-lg max-w-xs text-sm">
        <div className="mb-2 font-bold text-blue-800">¿Cómo agregar paradas intermedias?</div>
        <ul className="list-disc ml-5 mb-2 space-y-1">
          <li>
            <b>Click en una parada existente:</b> se agregará como intermedia.
          </li>
          <li>
            <b>Click sobre el recorrido:</b> se creará una nueva parada en ese punto.
          </li>
        </ul>
        <div className="text-xs text-blue-700 mb-2">
          Solo puedes agregar paradas sobre el recorrido marcado.
        </div>
      </div>
    );
  }

  if (newBusLine?.geometry?.coordinates?.length) return;

  return (
    <div className="absolute top-2 left-2 z-[1100] bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl shadow-lg max-w-xs text-sm border border-blue-200">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-bold text-base text-blue-800">Guía de creación de línea</span>
      </div>
      <ol className="mb-3 list-decimal list-inside space-y-2 pl-2">
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-green-700">Origen:</span> Haz clic en una parada del mapa para establecer el punto de origen.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-blue-700">Intermedias:</span> Haz clic para agregar hasta <b>{maxPoints - 2}</b> puntos intermedios.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span>
            <span className="font-semibold text-red-700">Destino:</span> Haz clic en una parada del mapa para establecer el destino final.
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
      {points.length > 0 && !finished && (
        <Button
          color="red"
          size="xs"
          onClick={handleReset}
          className="w-full"
        >
          Limpiar puntos
        </Button>
      )}
    </div>
  )
}

export default BusLineCreator