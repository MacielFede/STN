import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { DEFAULT_COORDINATES } from '@/utils/constants'

export function useUserLocation() {
  const [position, setPosition] =
    useState<[number, number]>(DEFAULT_COORDINATES)
  const [error, setError] = useState<undefined | 'unauthorized' | 'execution'>()

  useEffect(() => {
    let permissionStatus: PermissionStatus

    const getPosition = () => {
      if (permissionStatus.state !== 'granted') {
        setError('unauthorized')
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setPosition([coords.latitude, coords.longitude])
          setError(undefined)
        },
        (err) => {
          setError('execution')
          // eslint-disable-next-line no-console
          console.error('Error obteniendo ubicación:', err)
          toast.error('No se pudo determinar su ubicación', {
            position: 'top-left',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
            toastId: 'Location-error',
          })
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        },
      )
    }
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permissionStatus = status
        getPosition()
        permissionStatus.addEventListener('change', getPosition)
      })
      .catch((e) => {
        setError('unauthorized')
        toast.error(
          'Error al obtener permiso de tu ubicación, deberás cambiarlo manualmente',
          {
            position: 'top-left',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
            toastId: 'Location-error',
          },
        )
        // eslint-disable-next-line no-console
        console.error(e)
      })

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', getPosition)
      }
    }
  }, [])

  return { position, error }
}
