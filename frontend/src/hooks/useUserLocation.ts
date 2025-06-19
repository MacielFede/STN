import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export function useUserLocation() {
  const [position, setPosition] = useState<[number, number]>([-32.5, -56.164])
  const [error, setError] = useState<undefined | 'unauthorized' | 'execution'>()

  useEffect(() => {
    let permissionStatus: PermissionStatus

    const getPosition = () => {
      if (permissionStatus.state !== 'granted') {
        setError('unauthorized')
        return
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
          timeout: 10000,
          maximumAge: 0,
        },
      )
    }

    const handlePermissionChange = () => {
      getPosition()
    }

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permissionStatus = status
        getPosition()
        permissionStatus.addEventListener('change', handlePermissionChange)
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
        permissionStatus.removeEventListener('change', handlePermissionChange)
      }
    }
  }, [])

  return { position, error }
}
