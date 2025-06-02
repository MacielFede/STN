import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export function useUserLocation() {
  const [position, setPosition] = useState<[number, number]>([-34.9011, -56.1645])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition([coords.latitude, coords.longitude]),
      (err) => {
        console.error('Error obteniendo ubicación:', err)
        toast.error('No se pudo determinar su ubicación', {
          position: 'top-right',
          autoClose: 5000,
          theme: 'colored',
          toastId: 'Location-error',
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [])

  return position
}
