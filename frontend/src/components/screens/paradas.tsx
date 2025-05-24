import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  LayersControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
//import 'leaflet-realtime';
//import './styles.css';

interface Empresa {
  codigo: string;
  descripcion: string;
}

interface Feature {
  properties: {
    linea: string;
    codigoEmpresa: number;
    subsistemaDesc: string;
    destinoDesc: string;
    sublinea: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

const empresas: Empresa[] = [
  { codigo: '10', descripcion: 'C.O.E.T.C.' },
  { codigo: '13', descripcion: 'EMPRESA CASANOVA LIMITADA' },
  { codigo: '18', descripcion: 'C.O.P.S.A.' },
  { codigo: '20', descripcion: 'C.O.M.E.S.A' },
  { codigo: '29', descripcion: 'C.I.T.A.' },
  { codigo: '32', descripcion: 'SAN ANTONIO TRANSPORTE Y TURISMO (SATT)' },
  { codigo: '33', descripcion: 'C.O. DEL ESTE' },
  { codigo: '35', descripcion: 'TALA-PANDO-MONTEVIDEO' },
  { codigo: '36', descripcion: 'SOLFY SA' },
  { codigo: '37', descripcion: 'TURIL SA' },
  { codigo: '39', descripcion: 'ZEBALLOS HERMANOS' },
  { codigo: '41', descripcion: 'RUTAS DEL NORTE' },
  { codigo: '50', descripcion: 'C.U.T.C.S.A.' },
  { codigo: '60', descripcion: 'RA.IN.COOP.' },
  { codigo: '70', descripcion: 'U.C.O.T.' },
  { codigo: '80', descripcion: 'COIT' }
];

const mapEmpresas = new Map<number, string>();
empresas.forEach(emp => mapEmpresas.set(parseInt(emp.codigo), emp.descripcion));

const getImageForEmpresa = (empresa: number): string => {
  switch (empresa) {
    case 10: return 'marker-rojo.png';
    case 20: return 'marker-verde.png';
    case 50: return 'marker_hole.png';
    case 70: return 'marker-amarillo.png';
    default: return 'marker-gris.png';
  }
};

const BusMap = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [empresa, setEmpresa] = useState<string>('10');
  const [refresh, setRefresh] = useState<number>(10);
  const mapRef = useRef<L.Map>(null);

  const fetchData = async () => {
    const response = await fetch('rest/stm-online', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ empresa })
    });
    const data = await response.json();
    setFeatures(data.features);
    if (data.features.length === 1) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      mapRef.current?.setView([lat, lng], 14);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refresh * 1000);
    return () => clearInterval(interval);
  }, [empresa, refresh]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <label>
          Empresa:
          <select value={empresa} onChange={(e) => setEmpresa(e.target.value)}>
            {empresas.map((e) => (
              <option key={e.codigo} value={e.codigo}>{e.descripcion}</option>
            ))}
          </select>
        </label>
        <label>
          Refresh (s):
          <input type="number" value={refresh} onChange={(e) => setRefresh(Number(e.target.value))} />
        </label>
      </div>
      <MapContainer
        center={[-34.828, -56.180]}
        zoom={12}
        style={{ height: '600px', width: '100%' }}
        //whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url="http://geoserver.montevideo.gub.uy/geoserver/gwc/service/wms?"
          params={{
            layers: 'stm_carto_basica',
            format: 'image/png',
            transparent: true,
            version: '1.3.0',
            tiled: true,
            srs: 'EPSG:3857'
          }}
        />
        {features.map((f, idx) => {
          const [lng, lat] = f.geometry.coordinates;
          const image = getImageForEmpresa(f.properties.codigoEmpresa);
          const label = `
            <b>Linea:</b> ${f.properties.linea}<br/>
            <b>Subsistema:</b> ${f.properties.subsistemaDesc}<br/>
            <b>Empresa:</b> ${mapEmpresas.get(f.properties.codigoEmpresa)}<br/>
            <b>Destino:</b> ${f.properties.destinoDesc}<br/>
            <b>Sublinea:</b> ${f.properties.sublinea}<br/>
          `;

          return (
            <Marker
              key={idx}
              position={[lat, lng]}
              icon={L.icon({
                iconUrl: `leaflet/images/${image}`,
                iconSize: [25, 43],
                iconAnchor: [13, 43],
                popupAnchor: [0, -33],
                className: 'leaflet-div-icon'
              })}
            >
              <Popup>
                <div dangerouslySetInnerHTML={{ __html: label }} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default BusMap;
