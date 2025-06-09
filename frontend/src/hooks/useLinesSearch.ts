import { useState } from 'react'
import { toast } from 'react-toastify'
import { geoApi } from '@/api/config'

type Line = {
  id: string
  number: string
  companyId: string
  geometry: GeoJSON.GeoJsonObject
}

function latLngsToWktPolygon(points: [number, number][]): string {
  const coords = points.map(([lat, lng]) => `${lng} ${lat}`).join(', ')
  const [firstLat, firstLng] = points[0]
  return `POLYGON((${coords}, ${firstLng} ${firstLat}))`
}

function parseLines(features: any[]): Line[] {
  return features
    .map((f) => {
      const id = String(f.id ?? f.properties?.id)
      const geometry = f.geometry
      if (!id || !geometry) return null

      return {
        id,
        geometry,
        number: f.properties?.number ?? '(sin número)',
        companyId: f.properties?.companyId ?? '(sin empresa)',
      }
    })
    .filter((line): line is Line => line !== null)
}

export function useLinesSearch() {
  const [intersectingLines, setIntersectingLines] = useState<Line[]>([])

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
