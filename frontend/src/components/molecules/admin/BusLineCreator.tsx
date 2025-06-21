import { useCallback, useEffect, useRef, useState } from 'react'
import { FeatureGroup, Marker, Polyline, useMap, useMapEvents, Tooltip } from 'react-leaflet'
import L, { point } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { getLineFromGraphHopper } from '@/services/busLines'
import type { BusLineFeature, LineStringGeometry } from '@/models/geoserver'
import { useBusLineContext } from '@/contexts/BusLineContext'
import { Button } from 'flowbite-react'

const mockCoordinates: LineStringGeometry = {
  type: "LineString",
  coordinates: [
    [
      -56.165165,
      -34.893894
    ],
    [
      -56.165093,
      -34.894545
    ],
    [
      -56.165059,
      -34.894999
    ],
    [
      -56.16489,
      -34.896445
    ],
    [
      -56.164832,
      -34.896517
    ],
    [
      -56.164803,
      -34.896591
    ],
    [
      -56.164777,
      -34.896733
    ],
    [
      -56.164761,
      -34.896778
    ],
    [
      -56.164729,
      -34.896819
    ],
    [
      -56.164687,
      -34.896827
    ],
    [
      -56.164641,
      -34.896825
    ],
    [
      -56.164793,
      -34.895459
    ],
    [
      -56.164674,
      -34.895126
    ],
    [
      -56.16458,
      -34.894892
    ],
    [
      -56.163712,
      -34.89447
    ],
    [
      -56.163485,
      -34.894369
    ],
    [
      -56.162548,
      -34.894011
    ],
    [
      -56.161943,
      -34.893759
    ],
    [
      -56.16167,
      -34.893638
    ],
    [
      -56.160394,
      -34.89297
    ],
    [
      -56.159118,
      -34.892276
    ],
    [
      -56.158971,
      -34.892216
    ],
    [
      -56.158465,
      -34.892105
    ],
    [
      -56.157826,
      -34.891954
    ],
    [
      -56.157562,
      -34.891842
    ],
    [
      -56.15389,
      -34.890956
    ],
    [
      -56.152872,
      -34.890746
    ],
    [
      -56.152579,
      -34.890704
    ],
    [
      -56.151852,
      -34.890528
    ],
    [
      -56.150567,
      -34.890195
    ],
    [
      -56.150148,
      -34.890058
    ],
    [
      -56.149237,
      -34.889679
    ],
    [
      -56.148012,
      -34.889123
    ],
    [
      -56.14716,
      -34.888746
    ],
    [
      -56.147004,
      -34.888668
    ],
    [
      -56.145844,
      -34.888243
    ],
    [
      -56.144939,
      -34.887886
    ],
    [
      -56.144232,
      -34.887636
    ],
    [
      -56.142055,
      -34.886948
    ],
    [
      -56.14178,
      -34.886879
    ],
    [
      -56.141589,
      -34.886847
    ],
    [
      -56.141438,
      -34.886832
    ],
    [
      -56.139998,
      -34.886767
    ],
    [
      -56.138519,
      -34.886717
    ],
    [
      -56.137933,
      -34.886698
    ],
    [
      -56.137283,
      -34.886703
    ],
    [
      -56.135707,
      -34.886739
    ],
    [
      -56.131416,
      -34.886869
    ],
    [
      -56.130542,
      -34.886888
    ],
    [
      -56.129558,
      -34.886919
    ],
    [
      -56.1262,
      -34.886995
    ],
    [
      -56.12221,
      -34.887159
    ],
    [
      -56.118782,
      -34.887316
    ],
    [
      -56.117822,
      -34.887354
    ],
    [
      -56.116686,
      -34.887372
    ],
    [
      -56.115217,
      -34.887381
    ],
    [
      -56.114479,
      -34.887405
    ],
    [
      -56.112854,
      -34.887473
    ],
    [
      -56.11265,
      -34.887473
    ],
    [
      -56.111693,
      -34.887378
    ],
    [
      -56.111087,
      -34.887298
    ],
    [
      -56.110175,
      -34.887112
    ],
    [
      -56.106853,
      -34.886357
    ],
    [
      -56.106484,
      -34.886285
    ],
    [
      -56.105872,
      -34.886187
    ],
    [
      -56.10545,
      -34.886135
    ],
    [
      -56.104862,
      -34.886074
    ],
    [
      -56.104604,
      -34.886055
    ],
    [
      -56.104067,
      -34.886033
    ],
    [
      -56.103168,
      -34.88603
    ],
    [
      -56.101542,
      -34.886068
    ],
    [
      -56.100691,
      -34.886063
    ],
    [
      -56.100466,
      -34.886054
    ],
    [
      -56.100245,
      -34.886029
    ],
    [
      -56.099796,
      -34.885949
    ],
    [
      -56.098173,
      -34.885592
    ],
    [
      -56.09714,
      -34.885349
    ],
    [
      -56.095695,
      -34.885042
    ],
    [
      -56.093948,
      -34.884549
    ],
    [
      -56.091005,
      -34.883726
    ],
    [
      -56.090385,
      -34.88356
    ],
    [
      -56.089976,
      -34.883477
    ],
    [
      -56.089772,
      -34.883448
    ],
    [
      -56.08937,
      -34.883426
    ],
    [
      -56.088094,
      -34.883403
    ],
    [
      -56.084925,
      -34.883377
    ],
    [
      -56.084756,
      -34.88337
    ],
    [
      -56.084427,
      -34.883342
    ],
    [
      -56.083666,
      -34.883222
    ],
    [
      -56.083276,
      -34.883119
    ],
    [
      -56.08246,
      -34.882777
    ],
    [
      -56.08156,
      -34.88243
    ],
    [
      -56.08089,
      -34.882183
    ],
    [
      -56.075351,
      -34.880265
    ],
    [
      -56.070749,
      -34.878656
    ],
    [
      -56.070077,
      -34.878469
    ],
    [
      -56.069534,
      -34.878387
    ],
    [
      -56.067898,
      -34.878212
    ],
    [
      -56.067385,
      -34.878164
    ],
    [
      -56.06154,
      -34.877639
    ],
    [
      -56.058413,
      -34.877351
    ],
    [
      -56.053695,
      -34.876938
    ],
    [
      -56.052773,
      -34.876846
    ],
    [
      -56.050252,
      -34.876613
    ],
    [
      -56.045653,
      -34.876207
    ],
    [
      -56.045083,
      -34.876146
    ],
    [
      -56.039275,
      -34.875622
    ],
    [
      -56.038662,
      -34.875594
    ],
    [
      -56.037232,
      -34.875641
    ],
    [
      -56.036792,
      -34.87564
    ],
    [
      -56.036342,
      -34.875616
    ],
    [
      -56.034906,
      -34.875476
    ],
    [
      -56.034541,
      -34.87542
    ],
    [
      -56.034044,
      -34.875261
    ],
    [
      -56.033611,
      -34.875066
    ],
    [
      -56.033299,
      -34.874879
    ],
    [
      -56.033125,
      -34.874752
    ],
    [
      -56.032895,
      -34.874547
    ],
    [
      -56.032769,
      -34.874414
    ],
    [
      -56.032661,
      -34.874285
    ],
    [
      -56.032572,
      -34.874156
    ],
    [
      -56.032412,
      -34.873881
    ],
    [
      -56.032287,
      -34.873582
    ],
    [
      -56.032199,
      -34.873203
    ],
    [
      -56.031748,
      -34.870608
    ],
    [
      -56.030804,
      -34.865089
    ],
    [
      -56.030522,
      -34.863474
    ],
    [
      -56.030306,
      -34.862157
    ],
    [
      -56.029829,
      -34.859425
    ],
    [
      -56.029642,
      -34.858406
    ],
    [
      -56.029537,
      -34.857989
    ],
    [
      -56.029378,
      -34.85756
    ],
    [
      -56.029285,
      -34.857345
    ],
    [
      -56.029187,
      -34.85715
    ],
    [
      -56.02901,
      -34.856845
    ],
    [
      -56.028127,
      -34.855483
    ],
    [
      -56.026734,
      -34.853374
    ],
    [
      -56.026285,
      -34.852631
    ],
    [
      -56.025279,
      -34.851083
    ],
    [
      -56.024036,
      -34.849168
    ],
    [
      -56.023815,
      -34.848801
    ],
    [
      -56.023622,
      -34.84842
    ],
    [
      -56.023535,
      -34.848171
    ],
    [
      -56.023474,
      -34.847859
    ],
    [
      -56.023455,
      -34.847553
    ],
    [
      -56.023477,
      -34.847218
    ],
    [
      -56.023533,
      -34.846978
    ],
    [
      -56.023763,
      -34.846324
    ],
    [
      -56.023786,
      -34.846032
    ],
    [
      -56.023502,
      -34.845782
    ],
    [
      -56.023299,
      -34.845627
    ],
    [
      -56.023198,
      -34.84556
    ],
    [
      -56.0231,
      -34.845503
    ],
    [
      -56.022943,
      -34.845433
    ],
    [
      -56.022577,
      -34.8453
    ],
    [
      -56.017578,
      -34.843809
    ],
    [
      -56.016725,
      -34.843564
    ],
    [
      -56.016362,
      -34.843442
    ],
    [
      -56.015834,
      -34.843217
    ],
    [
      -56.015466,
      -34.84302
    ],
    [
      -56.015186,
      -34.842849
    ],
    [
      -56.014811,
      -34.842586
    ],
    [
      -56.014534,
      -34.842358
    ],
    [
      -56.014368,
      -34.842208
    ],
    [
      -56.014025,
      -34.84184
    ],
    [
      -56.013886,
      -34.841672
    ],
    [
      -56.013616,
      -34.841295
    ],
    [
      -56.013493,
      -34.841087
    ],
    [
      -56.013393,
      -34.840891
    ],
    [
      -56.01329,
      -34.840672
    ],
    [
      -56.01319,
      -34.840403
    ],
    [
      -56.01306,
      -34.839941
    ],
    [
      -56.012946,
      -34.839397
    ],
    [
      -56.01269,
      -34.838317
    ],
    [
      -56.012508,
      -34.837628
    ],
    [
      -56.012158,
      -34.83605
    ],
    [
      -56.012082,
      -34.835668
    ],
    [
      -56.011772,
      -34.834324
    ],
    [
      -56.011405,
      -34.832695
    ],
    [
      -56.01131,
      -34.832318
    ],
    [
      -56.011182,
      -34.831978
    ],
    [
      -56.011075,
      -34.831768
    ],
    [
      -56.010806,
      -34.831387
    ],
    [
      -56.010671,
      -34.831238
    ],
    [
      -56.010487,
      -34.831066
    ],
    [
      -56.010295,
      -34.830911
    ],
    [
      -56.010111,
      -34.830787
    ],
    [
      -56.009886,
      -34.830659
    ],
    [
      -56.009372,
      -34.83042
    ],
    [
      -56.005817,
      -34.828889
    ],
    [
      -56.000665,
      -34.82664
    ],
    [
      -55.99937,
      -34.826088
    ],
    [
      -55.998199,
      -34.825573
    ],
    [
      -55.994596,
      -34.823929
    ],
    [
      -55.99047,
      -34.822048
    ],
    [
      -55.989541,
      -34.821614
    ],
    [
      -55.988815,
      -34.821296
    ],
    [
      -55.987844,
      -34.820907
    ],
    [
      -55.986888,
      -34.820563
    ],
    [
      -55.985736,
      -34.820171
    ],
    [
      -55.980089,
      -34.818177
    ],
    [
      -55.978553,
      -34.817642
    ],
    [
      -55.973015,
      -34.815697
    ],
    [
      -55.972765,
      -34.815594
    ],
    [
      -55.972204,
      -34.815334
    ],
    [
      -55.971819,
      -34.815122
    ],
    [
      -55.971216,
      -34.814739
    ],
    [
      -55.969729,
      -34.813739
    ],
    [
      -55.967938,
      -34.812525
    ],
    [
      -55.964472,
      -34.810223
    ],
    [
      -55.958158,
      -34.805995
    ],
    [
      -55.953906,
      -34.803143
    ],
    [
      -55.946264,
      -34.798024
    ],
    [
      -55.944625,
      -34.796915
    ],
    [
      -55.944308,
      -34.796673
    ],
    [
      -55.943493,
      -34.796015
    ],
    [
      -55.943277,
      -34.796166
    ],
    [
      -55.943151,
      -34.796206
    ],
    [
      -55.942729,
      -34.796266
    ],
    [
      -55.942134,
      -34.796377
    ],
    [
      -55.940572,
      -34.796694
    ],
    [
      -55.936355,
      -34.797529
    ],
    [
      -55.93395,
      -34.798017
    ],
    [
      -55.931906,
      -34.798383
    ],
    [
      -55.929841,
      -34.798652
    ],
    [
      -55.928556,
      -34.79883
    ],
    [
      -55.927997,
      -34.798931
    ],
    [
      -55.927454,
      -34.799042
    ],
    [
      -55.924002,
      -34.799867
    ],
    [
      -55.921172,
      -34.800558
    ],
    [
      -55.920965,
      -34.8006
    ],
    [
      -55.92077,
      -34.800707
    ],
    [
      -55.920458,
      -34.800839
    ],
    [
      -55.920224,
      -34.800727
    ],
    [
      -55.916791,
      -34.798846
    ],
    [
      -55.916234,
      -34.798562
    ],
    [
      -55.915897,
      -34.798404
    ],
    [
      -55.915254,
      -34.798143
    ],
    [
      -55.914637,
      -34.797928
    ],
    [
      -55.909844,
      -34.79641
    ]
  ]
}

const BusLineCreator = () => {
  const {
    calculatedRoute,
    setCalculatedRoute,
    finished,
    setFinished,
    points,
    setPoints,
    editing,
    stopEditing,
    updatePointsFromDraw,
    setHoveredIdx,
    addPoint,
    mousePos,
    setMousePos,
    newBusLine,
    setNewBusLine,
    busLineStep,
    handleDeletePoint,
    handleReset,
    handleFinished,
    MAX_POINTS,
    polylineRef,
    featureGroupRef,
    drawControlRef,
  } = useBusLineContext();
  const map = useMap();

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

  useEffect(() => {
    if (!editing || !map || !featureGroupRef.current || points.length < 2) return;

    featureGroupRef.current.clearLayers();

    const leafletPolyline = L.polyline(
      points.map(([lng, lat]) => [lat, lng]),
      { color: 'blue', weight: 4 }
    );
    featureGroupRef.current.addLayer(leafletPolyline);

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
      stopEditing();
      map.removeControl(drawControlRef.current!);
    };

    map.on(L.Draw.Event.EDITED, onEdited);

    return () => {
      map.off(L.Draw.Event.EDITED, onEdited);
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
    };
  }, [editing, map, points, updatePointsFromDraw, stopEditing]);

  useMapEvents({
    click(e) {
      addPoint(e.latlng.lng, e.latlng.lat);
    },
    mousemove(e) {
      setMousePos([e.latlng.lng, e.latlng.lat]);
    },
    mouseout() {
      setMousePos(null);
    }
  });

  useEffect(() => {
    if (!finished) return;

    if (editing) {
      const latlngs = featureGroupRef.current?.getLayers().flatMap(layer => {
        if (layer instanceof L.Polyline) {
          return layer.getLatLngs().map((latlng: L.LatLng) => [latlng.lng, latlng.lat]);
        }
        return [];
      }) || [];
      setNewBusLine((prev) => ({
        ...prev,
        geometry: {
          type: "LineString",
          coordinates: latlngs,
        },
      }));
      setPoints(latlngs);
      setCalculatedRoute({
        type: "LineString",
        coordinates: latlngs,
      });

      featureGroupRef.current?.clearLayers();

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      const polyline = L.polyline(
        latlngs.map(([lng, lat]) => [lat, lng]),
        { color: 'green', weight: 4 }
      );
      polyline.addTo(map);
      map.fitBounds(polyline.getBounds());
      polylineRef.current = polyline;

      stopEditing();
      setFinished(false);
      return;
    }

    const calculateRoute = async () => {
      clearAllMapLayers();
      await handleFinished();
      const coordinates = await getLineFromGraphHopper(points.map(p => [p[0], p[1]]))
      setCalculatedRoute(coordinates || null);
      if (coordinates) {
        setNewBusLine((prev) => ({
          ...prev,
          geometry: coordinates,
        }));

        setPoints(coordinates.coordinates.map(([lng, lat]) => [lng, lat]));
        setFinished(false)
      }
    };
    calculateRoute();
  }, [finished, editing, featureGroupRef, polylineRef, setNewBusLine, setPoints, setCalculatedRoute, handleFinished, map, clearAllMapLayers]);

  useEffect(() => {
    if (!calculatedRoute || editing) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const polyline = L.polyline(
      calculatedRoute.coordinates.map(([lng, lat]) => [lat, lng]),
      { color: 'green', weight: 4 }
    );
    polyline.addTo(map);
    polylineRef.current = polyline;
    map.fitBounds(polyline.getBounds());

    setFinished(false);

    return () => {
      map.removeLayer(polyline);
      polylineRef.current = null;
    };
  }, [calculatedRoute, editing, map, polylineRef, setFinished]);

  useEffect(() => {
    if (!polylineRef.current || newBusLine?.geometry?.coordinates?.length) return;

    map.removeLayer(polylineRef.current);
    polylineRef.current = null;
    setCalculatedRoute(null);
  }, [newBusLine, polylineRef, setCalculatedRoute, map]);

  useEffect(() => {
    const mapContainer = map.getContainer();
    if (!calculatedRoute && busLineStep === 'creation') {
      mapContainer.style.cursor = `crosshair`;
      return;
    }
    mapContainer.style.cursor = '';
    return () => {
      mapContainer.style.cursor = '';
    };
  }, [map, calculatedRoute, busLineStep]);

  const previewLine =
    !finished && points.length > 0 && mousePos && points.length < MAX_POINTS
      ? [...points, mousePos]
      : null;

  return (
    <>
      {!newBusLine?.geometry?.coordinates?.length && (
        <BusLineGuide
          points={points}
          finished={finished}
          handleReset={handleReset}
          maxPoints={MAX_POINTS}
        />
      )}
      <FeatureGroup ref={featureGroupRef} />
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
                    ? 'Destino (doble clic para borrar)'
                    : `Intermedio ${idx} (doble clic para borrar)`}
              </Tooltip>
            </Marker>
          ))}
          {points.length > 1 && !editing && (
            <Polyline
              positions={points.map(([lng, lat]) => [lat, lng])}
              color="blue"
              weight={4}
            />
          )}
          {previewLine && !editing && (
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
  );
};

interface BusLineGuideProps {
  points: [number, number][]
  finished: boolean
  handleReset: () => void
  maxPoints?: number
}

const BusLineGuide: React.FC<BusLineGuideProps> = ({ points, finished, handleReset, maxPoints = 10 }) => {
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