import { useState } from 'react'
import { toast } from 'react-toastify'
import { geoApi } from '@/api/config'
import type { BusLineProperties } from '@/models/database'
import type { GeoJsonObject } from 'geojson'

interface BusLineWithGeometry extends BusLineProperties {
  geometry: GeoJsonObject
}

function latLngsToWktPolygon(points: [number, number][]): string {
  const coords = points.map(([lat, lng]) => `${lng} ${lat}`).join(', ')
  const [firstLat, firstLng] = points[0]
  return `POLYGON((${coords}, ${firstLng} ${firstLat}))`
}

function parseLines(features: any[]): BusLineWithGeometry[] {
  return features
    .map((f) => {
      const properties = f.properties
      const geometry = f.geometry
      if (!properties || !geometry) return null

      return {
        ...properties,
        geometry,
      } as BusLineWithGeometry
    })
    .filter((line): line is BusLineWithGeometry => line !== null)
}

export function useLinesSearch() {
  const [intersectingLines, setIntersectingLines] = useState<BusLineWithGeometry[]>([])

  async function searchLines(polygonPoints: [number, number][]) {
    if (polygonPoints.length < 3) {
      toast.warn('El polígono debe tener al menos 3 puntos.', {
        theme: 'colored',
      })
      return
    }

    const wktPolygon = latLngsToWktPolygon(polygonPoints)
    try {
      const response = await geoApi.get('', {
        params: {
          typeName: 'myworkspace:ft_bus_line',
          CQL_FILTER: `INTERSECTS(geometry, ${wktPolygon})`,
        },
      })
      const lines = response.data.features || []
      const parsedLines = parseLines(lines)
      setIntersectingLines(parsedLines)

      console.log('GeoServer response:', lines)
      console.log('Parsed lines:', parsedLines)
    } catch (error) {
      console.error('Error al consultar líneas en GeoServer:', error)
      toast.error('Error al obtener líneas desde GeoServer')
    }
  }

  return { intersectingLines, searchLines, setIntersectingLines }
}
