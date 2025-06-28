import { Drawer } from 'flowbite-react'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'
import { useMapEvents } from 'react-leaflet'
import {
  lineString,
  nearestPointOnLine,
  point,
  pointToLineDistance,
} from '@turf/turf'
import { Button } from '@/components/ui/button'
import { useBusLineContext } from '@/contexts/BusLineContext'
import {
  createBusLine,
  createStopLine,
  deleteStopLine,
  getStopLineByBusLineId,
  isDestinationStopOnStreet,
  isIntermediateStopOnStreet,
  isOriginStopOnStreet,
  updateBusLine,
  updateStopLine,
} from '@/services/busLines'
import { Input } from '@/components/ui/input'
import { _getStops, getStopGeoServer } from '@/services/busStops'
import { updateStopStatusesWithBusLineStatus } from '@/services/stopStatusService'
import {
  BASIC_STOP_FEATURE,
  DISTANCE_BETWEEN_STOPS_AND_STREET,
} from '@/utils/constants'
import { useBusStopContext } from '@/contexts/BusStopContext'
import { getHoursAndMinutes } from '@/utils/helpers'

const StopAssignmentDrawer = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  const {
    points,
    newBusLine,
    busLineStep,
    setBusLineStep,
    originStop,
    destinationStop,
    intermediateStops,
    selectedStops,
    cleanUpBusLineStates,
    setOriginStop,
    setDestinationStop,
    setIntermediateStops,
    cacheStop,
    cacheStopRemove,
    updateBusLineData,
    showLoader,
    hideLoader,
  } = useBusLineContext()
  const { stop: activeStop, setStop } = useBusStopContext()
  const [isSaving, setIsSaving] = useState(false)

  const getStopStyle = (id: number | null) => {
    if (!id) return ''
    return 'bg-blue-50 border border-blue-400 rounded p-2 mt-1'
  }

  const timeToSeconds = (t: string) => {
    const [h, m, s] = t.split(':').map(Number)
    return h * 3600 + m * 60 + (s || 0)
  }

  const areStopTimesOrdered = () => {
    const allStops = [originStop, ...intermediateStops, destinationStop]

    const timesLength = originStop.estimatedTimes.length
    if (
      timesLength === 0 ||
      allStops.some((stop) => stop.estimatedTimes.length !== timesLength) ||
      allStops.some((stop) =>
        stop.estimatedTimes.some((time) => !time || time.trim() === ''),
      )
    ) {
      return false
    }

    for (let i = 0; i < timesLength; i++) {
      let prev = timeToSeconds(allStops[0].estimatedTimes[i])
      for (let j = 1; j < allStops.length; j++) {
        const curr = timeToSeconds(allStops[j].estimatedTimes[i])
        if (prev >= curr) return false
        prev = curr
      }
    }
    return true
  }

  const addEstimatedTime = (
    type: 'origin' | 'destination' | 'intermediate',
    stopIndex?: number,
  ) => {
    if (type === 'origin') {
      setOriginStop((prev) => ({
        ...prev,
        estimatedTimes: [...prev.estimatedTimes, ''],
      }))
    } else if (type === 'destination') {
      setDestinationStop((prev) => ({
        ...prev,
        estimatedTimes: [...prev.estimatedTimes, ''],
      }))
    } else if (stopIndex !== undefined) {
      setIntermediateStops((prev) =>
        prev.map((stop, index) =>
          index === stopIndex
            ? { ...stop, estimatedTimes: [...stop.estimatedTimes, ''] }
            : stop,
        ),
      )
    }
  }

  const removeEstimatedTime = (
    type: 'origin' | 'destination' | 'intermediate',
    timeIndex: number,
    stopIndex?: number,
  ) => {
    if (type === 'origin') {
      setOriginStop((prev) => ({
        ...prev,
        estimatedTimes: prev.estimatedTimes.filter(
          (_, index) => index !== timeIndex,
        ),
      }))
    } else if (type === 'destination') {
      setDestinationStop((prev) => ({
        ...prev,
        estimatedTimes: prev.estimatedTimes.filter(
          (_, index) => index !== timeIndex,
        ),
      }))
    } else if (stopIndex !== undefined) {
      setIntermediateStops((prev) =>
        prev.map((stop, index) =>
          index === stopIndex
            ? {
                ...stop,
                estimatedTimes: stop.estimatedTimes.filter(
                  (_, timeIdx) => timeIdx !== timeIndex,
                ),
              }
            : stop,
        ),
      )
    }
  }

  const updateEstimatedTime = (
    type: 'origin' | 'destination' | 'intermediate',
    timeIndex: number,
    value: string,
    stopIndex?: number,
  ) => {
    const timeWithSeconds =
      value.includes(':') && value.split(':').length === 2
        ? `${value}:00`
        : value

    if (type === 'origin') {
      setOriginStop((prev) => ({
        ...prev,
        estimatedTimes: prev.estimatedTimes.map((time, index) =>
          index === timeIndex ? timeWithSeconds : time,
        ),
      }))
    } else if (type === 'destination') {
      setDestinationStop((prev) => ({
        ...prev,
        estimatedTimes: prev.estimatedTimes.map((time, index) =>
          index === timeIndex ? timeWithSeconds : time,
        ),
      }))
    } else if (stopIndex !== undefined) {
      setIntermediateStops((prev) =>
        prev.map((stop, index) =>
          index === stopIndex
            ? {
                ...stop,
                estimatedTimes: stop.estimatedTimes.map((time, timeIdx) =>
                  timeIdx === timeIndex ? timeWithSeconds : time,
                ),
              }
            : stop,
        ),
      )
    }
  }

  const handleSave = async (e) => {
    setIsSaving(true)
    e.preventDefault()

    try {
      // Basic validations
      if (originStop === null || destinationStop === null) {
        toast.error(
          'Por favor, selecciona un origen y un destino antes de guardar.',
        )
        return
      }
      if (!newBusLine?.geometry.coordinates.length) return

      showLoader()

      const stops = [originStop, destinationStop, ...intermediateStops]
      if (stops.length < 2) {
        toast.error('Debes seleccionar al menos un origen y un destino.')
        hideLoader(1500)
        return
      }
      if (!originStop.stop || !destinationStop.stop || !intermediateStops) {
        toast.error('Por favor, completa todos los campos antes de guardar.')
        hideLoader(1500)
        return
      }

      // Validate stops on street
      const originOk = await isOriginStopOnStreet(originStop.stop, newBusLine)
      const destinationOk = await isDestinationStopOnStreet(
        destinationStop.stop,
        newBusLine,
      )

      // Build set of intermediate stopIds that are NOT on the street
      const disabledIntermediateIds = new Set()
      for (const stop of intermediateStops) {
        if (!stop.stop) continue
        const intermediateOk = await isIntermediateStopOnStreet(
          stop.stop,
          newBusLine,
        )
        if (!intermediateOk) {
          disabledIntermediateIds.add(String(stop.stop.properties.id))
        }
      }

      if (!originOk) {
        toast.error('El origen seleccionado no es válido.')
        hideLoader(1500)
        return
      }
      if (!destinationOk) {
        toast.error('El destino seleccionado no es válido.')
        hideLoader(1500)
        return
      }
      if (intermediateStops.some((stop) => !stop.stop)) {
        toast.error('Todas las paradas intermedias deben ser válidas.')
        hideLoader(1500)
        return
      }
      if (
        originStop.estimatedTimes.length !==
        destinationStop.estimatedTimes.length
      ) {
        toast.error(
          'El número de horarios estimados debe ser el mismo para origen y destino.',
        )
        hideLoader(1500)
        return
      }

      // Create or update bus line
      if (!newBusLine.properties.id) {
        const response = await createBusLine({
          geometry: newBusLine.geometry,
          properties: {
            ...newBusLine.properties,
            schedule: getHoursAndMinutes(newBusLine.properties.schedule, true),
          },
        })
        if (!response || !response.data || !response.data.id) {
          toast.error('Error al crear la línea de bus, intenta nuevamente.')
          hideLoader(1500)
          return
        }
        updateBusLineData({
          ...newBusLine,
          properties: {
            ...newBusLine.properties,
            id: response.data.id,
          },
        })
        newBusLine.properties.id = response.data.id
      } else {
        const response = await updateBusLine({
          geometry: newBusLine.geometry,
          properties: {
            ...newBusLine.properties,
            schedule: getHoursAndMinutes(newBusLine.properties.schedule, true),
          },
        })
        if (!response || !response.data || !response.data.id) {
          toast.error(
            'Error al actualizar la línea de bus, intenta nuevamente.',
          )
          hideLoader(1500)
          return
        }
        updateBusLineData({
          ...newBusLine,
          properties: {
            ...newBusLine.properties,
            id: response.data.id,
          },
        })
      }

      const associations = await getStopLineByBusLineId(
        String(newBusLine.properties.id),
      )
      const associationMap = new Map<string, any>()
      associations.forEach((assoc) => {
        associationMap.set(`${assoc.stopId}_${assoc.estimatedTime}`, assoc)
      })

      // Prepare new assignments with correct isEnabled
      const newAssignments = stops.flatMap((stop) =>
        stop.estimatedTimes.map((estimatedTime) => {
          const stopId = String(stop.stop?.properties.id)
          let isEnabled = true
          if (disabledIntermediateIds.has(stopId)) isEnabled = false
          return {
            stopId,
            busLineId: String(newBusLine.properties.id),
            estimatedTime: String(estimatedTime),
            isEnabled,
          }
        }),
      )
      const newAssignmentKeys = new Set(
        newAssignments.map((a) => `${a.stopId}_${a.estimatedTime}`),
      )

      const upsertRequests = newAssignments.map(async (assignment) => {
        const key = `${assignment.stopId}_${assignment.estimatedTime}`
        if (associationMap.has(key)) {
          const assoc = associationMap.get(key)
          return updateStopLine(
            String(assoc.id),
            assignment.stopId,
            assignment.busLineId,
            assignment.estimatedTime,
            assignment.isEnabled,
          )
        } else {
          return createStopLine(
            assignment.stopId,
            assignment.busLineId,
            assignment.estimatedTime,
            assignment.isEnabled,
          )
        }
      })

      const toDeleteAssociations = associations.filter((assoc) => {
        return !newAssignmentKeys.has(`${assoc.stopId}_${assoc.estimatedTime}`)
      })
      const deleteRequests = toDeleteAssociations.map((assoc) =>
        deleteStopLine(String(assoc.id)),
      )

      await Promise.all([...upsertRequests, ...deleteRequests])

      await updateStopStatusesWithBusLineStatus(
        toDeleteAssociations, 
        stops, 
        newBusLine.properties.status,
        newBusLine.properties.id
      )
      hideLoader(1500)
      toast.success(
        `${newBusLine?.properties?.id ? 'Se actualizó' : 'Se creó'} linea de bus con éxito.`,
      )
      onClose()
    } catch (error) {
      hideLoader(1500)
      toast.error(
        'Hubo un error al guardar la asignación de paradas, intenta nuevamente.',
      )
      console.error('Error saving stop assignments:', error)
      cleanUpBusLineStates()
    } finally {
      setIsSaving(false)
    }
  }

  useMapEvents({
    click: async (e) => {
      if (busLineStep !== 'select-intermediate' || !newBusLine?.geometry) return

      const { lat, lng } = e.latlng

      const clickedPoint = point([lng, lat])
      const busLine = lineString(newBusLine.geometry.coordinates)
      const distance = pointToLineDistance(clickedPoint, busLine, {
        units: 'meters',
      })

      if (distance > DISTANCE_BETWEEN_STOPS_AND_STREET) {
        toast.error('Por favor, crea una parada en la trayectoria de la línea')
        return
      }

      setStop({
        ...BASIC_STOP_FEATURE,
        geometry: {
          type: 'Point',
          coordinates: [lat, lng],
        },
      })
    },
  })

  useEffect(() => {
    if (!open || !newBusLine || activeStop || isSaving) return

    const fetchAssociations = async () => {
      const busStopsForLine = await getStopLineByBusLineId(
        String(newBusLine?.properties.id),
      )
      if (!busStopsForLine || busStopsForLine.length === 0) return

      const stopsArray = await Promise.all(
        busStopsForLine.map(async (association) => {
          const geoStop = await getStopGeoServer(Number(association.stopId))
          return [Number(association.stopId), geoStop] as [number, any]
        }),
      )
      const stopsFromGeoServer = new Map<number, any>(stopsArray)

      let newOrigin = null
      let newDestination = null
      const newIntermediates: Array<{
        stop: any
        estimatedTimes: Array<string>
        status?: boolean
      }> = []

      const missingSelectedStopIds = Array.from(selectedStops.keys()).filter(
        (id) => !stopsFromGeoServer.has(Number(id)),
      )
      if (missingSelectedStopIds?.length) {
        const missingStops = await _getStops(
          `id IN (${missingSelectedStopIds.join(',')})`,
        )
        for (const stop of missingStops) {
          stopsFromGeoServer.set(stop.properties.id, stop)
        }
      }
      for (const [id, stop] of stopsFromGeoServer.entries()) {
        const stopLine = busStopsForLine.find(
          (assoc) => Number(assoc.stopId) === id,
        )
        const estimatedTimes = busStopsForLine
          .filter((assoc) => Number(assoc.stopId) === id)
          .map((assoc) => assoc.estimatedTime)
          .sort()

        if (await isOriginStopOnStreet(stop, newBusLine)) {
          newOrigin = { stop, estimatedTimes }
          cacheStop(stop)
        } else if (await isDestinationStopOnStreet(stop, newBusLine)) {
          newDestination = { stop, estimatedTimes }
          cacheStop(stop)
        } else {
          if (!(await isIntermediateStopOnStreet(stop, newBusLine))) {
            newIntermediates.push({ stop, estimatedTimes, status: false })
            cacheStop(stop)
            continue
          }
          newIntermediates.push({
            stop,
            estimatedTimes,
            status: stopLine?.isEnabled || undefined,
          })
          cacheStop(stop)
        }
      }

      if (
        newBusLine?.geometry &&
        Array.isArray(newBusLine.geometry.coordinates)
      ) {
        const busLine = lineString(newBusLine.geometry.coordinates)

        newIntermediates.sort((a, b) => {
          const aCoord = a.stop.geometry?.coordinates
          const bCoord = b.stop.geometry?.coordinates
          if (!aCoord || !bCoord) return 0

          const aSnap = nearestPointOnLine(busLine, point(aCoord))
          const bSnap = nearestPointOnLine(busLine, point(bCoord))

          return aSnap.properties.location - bSnap.properties.location
        })
      }

      setOriginStop(newOrigin ?? { stop: null, estimatedTimes: [] })
      setDestinationStop(newDestination ?? { stop: null, estimatedTimes: [] })
      setIntermediateStops(newIntermediates)
    }

    const fetchPointsFromCreation = async () => {
      const origin = points[0]
      const destination = points[points.length - 1]
      if (!origin || !destination) return

      const cqlFilter = `DWITHIN(geometry, POINT(${origin[0]} ${origin[1]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`
      const originData = await _getStops(cqlFilter)
      if (!originData || originData.length === 0) {
        toast.error(
          'No se encontró una parada de origen cerca del punto inicial.',
        )
        return
      }
      const destinationCqlFilter = `DWITHIN(geometry, POINT(${destination[0]} ${destination[1]}), ${DISTANCE_BETWEEN_STOPS_AND_STREET}, meters)`
      const destinationData = await _getStops(destinationCqlFilter)
      if (!destinationData || destinationData.length === 0) {
        toast.error(
          'No se encontró una parada de destino cerca del punto final.',
        )
        return
      }
      cacheStop(originData[0])
      cacheStop(destinationData[0])
      setOriginStop({
        stop: originData[0],
        estimatedTimes: originStop?.estimatedTimes ?? [],
      })
      setDestinationStop({
        stop: destinationData[0],
        estimatedTimes: destinationStop?.estimatedTimes ?? [],
      })

      const stops = [
        ...originData,
        ...destinationData,
        ...intermediateStops.map((i) => i.stop),
      ]
      const missingSelectedStopIds = Array.from(selectedStops.keys()).filter(
        (id) => !stops.some((stop) => stop.properties.id === Number(id)),
      )

      if (missingSelectedStopIds?.length) {
        const missingStops = await _getStops(
          `id IN (${missingSelectedStopIds.join(',')})`,
        )
        for (const stop of missingStops) {
          setIntermediateStops((prev) => [
            ...prev,
            { stop, estimatedTimes: [] },
          ])
          cacheStop(stop)
        }
      }
    }

    // If bus line is in edit mode
    if (newBusLine?.properties?.id) {
      fetchAssociations()
    } else {
      fetchPointsFromCreation()
    }
  }, [open, newBusLine, isSaving])

  return (
    <Drawer
      open={open}
      onClose={onClose}
      position="left"
      className="z-[5000] bg-white w-full sm:w-[400px] max-h-screen max-w-sm overflow-y-auto"
      backdrop={false}
    >
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-bold text-center">
          🚌 Asignación de paradas
        </h2>
        <p className="text-sm text-center text-gray-600">
          Seleccioná las paradas asociadas al recorrido dibujado:
        </p>

        <div className="bg-gray-100 p-3 rounded">
          <p className="font-semibold">
            🔘 Paso actual:
            {busLineStep === 'select-origin'
              ? 'Seleccionar origen'
              : busLineStep === 'select-destination'
                ? 'Seleccionar destino'
                : busLineStep === 'select-intermediate'
                  ? 'Seleccionar paradas intermedias'
                  : 'Finalizar asignación'}
          </p>
        </div>

        <div className="space-y-3">
          {/* ORIGIN STOP */}
          <div
            className={`p-2 rounded ${busLineStep === 'select-origin' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
          >
            {!originStop?.stop?.properties?.id && (
              <Button
                variant={
                  busLineStep === 'select-origin' ? 'default' : 'outline'
                }
                onClick={() => setBusLineStep('select-origin')}
              >
                Seleccionar origen
              </Button>
            )}
            <p
              className={`font-semibold ${busLineStep === 'select-origin' ? 'text-blue-800' : ''}`}
            >
              Origen:
            </p>
            <div className={getStopStyle(originStop?.stop?.properties?.id)}>
              {selectedStops.has(originStop?.stop?.properties?.id) ? (
                <>
                  <p>
                    {
                      selectedStops.get(originStop?.stop?.properties?.id)
                        ?.properties.name
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {
                      selectedStops.get(originStop.stop?.properties?.id)
                        ?.properties.description
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Refugio:{' '}
                    {selectedStops.get(originStop.stop?.properties?.id)
                      ?.properties.hasShelter
                      ? 'Sí'
                      : 'No'}
                  </p>

                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">
                        Horarios estimados:
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimatedTime('origin')}
                      >
                        + Agregar horario
                      </Button>
                    </div>
                    {originStop.estimatedTimes.map((time, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          type="time"
                          value={time ? time.substring(0, 5) : ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateEstimatedTime('origin', index, e.target.value)
                          }
                          className="border-black flex-1"
                        />
                        {originStop.estimatedTimes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEstimatedTime('origin', index)}
                          >
                            ❌
                          </Button>
                        )}
                      </div>
                    ))}
                    {originStop.estimatedTimes.length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimatedTime('origin')}
                      >
                        Agregar primer horario
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                '⬜ No seleccionado'
              )}
            </div>
          </div>

          {/* INTERMEDIATE STOPS */}
          <div
            className={`p-2 rounded ${busLineStep === 'select-intermediate' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
          >
            <p
              className={`font-semibold ${busLineStep === 'select-intermediate' ? 'text-blue-800' : ''}`}
            >
              Paradas intermedias:
            </p>
            <Button
              variant={
                busLineStep === 'select-intermediate' ? 'default' : 'outline'
              }
              onClick={() => setBusLineStep('select-intermediate')}
            >
              + Agregar parada
            </Button>
            <ul className="space-y-2 mt-2">
              {intermediateStops.length > 0 ? (
                intermediateStops.map((stop, stopIndex) => {
                  if (!stop || !stop.stop) return null
                  return (
                    <li
                      key={stopIndex}
                      className={`flex flex-col ${stop?.status || stop?.status === undefined ? 'bg-blue-50' : 'bg-gray-300'} p-2 rounded border border-blue-300`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          {selectedStops.get(stop.stop.properties.id)
                            ?.properties.name ||
                            `Parada ${stop.stop.properties.id}`}
                        </span>
                        {(stop.status || stop?.status === undefined) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIntermediateStops((prev) =>
                                prev.filter((_, index) => index !== stopIndex),
                              )
                              cacheStopRemove(stop?.stop?.properties?.id)
                            }}
                          >
                            ❌
                          </Button>
                        )}
                      </div>
                      {stop?.status ? <p>estoy</p> : <p>no estoy</p>}
                      <p className="text-xs text-gray-500">
                        {
                          selectedStops.get(stop.stop.properties.id)?.properties
                            .description
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        Refugio:{' '}
                        {selectedStops.get(stop.stop.properties.id)?.properties
                          .hasShelter
                          ? 'Sí'
                          : 'No'}
                      </p>

                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium">
                            Horarios estimados:
                          </label>
                          {(stop?.status || stop?.status === undefined) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                addEstimatedTime('intermediate', stopIndex)
                              }
                            >
                              + Horario
                            </Button>
                          )}
                        </div>
                        {stop.estimatedTimes.map((time, timeIndex) => (
                          <div key={timeIndex} className="flex gap-2 mb-2">
                            <Input
                              type="time"
                              disabled={
                                !stop.status && stop.status !== undefined
                              }
                              value={time ? time.substring(0, 5) : ''}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                updateEstimatedTime(
                                  'intermediate',
                                  timeIndex,
                                  e.target.value,
                                  stopIndex,
                                )
                              }
                              className="border-black flex-1"
                            />
                            {stop.estimatedTimes.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeEstimatedTime(
                                    'intermediate',
                                    timeIndex,
                                    stopIndex,
                                  )
                                }
                              >
                                ❌
                              </Button>
                            )}
                          </div>
                        ))}
                        {stop.status && stop.estimatedTimes.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              addEstimatedTime('intermediate', stopIndex)
                            }
                          >
                            Agregar primer horario
                          </Button>
                        )}
                      </div>
                    </li>
                  )
                })
              ) : (
                <li className="text-gray-500 text-sm">
                  No hay paradas intermedias seleccionadas
                </li>
              )}
            </ul>
          </div>

          {/* DESTINATION STOP */}
          <div
            className={`p-2 rounded ${busLineStep === 'select-destination' ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
          >
            {!destinationStop?.stop?.properties?.id && (
              <Button
                variant={
                  busLineStep === 'select-destination' ? 'default' : 'outline'
                }
                onClick={() => setBusLineStep('select-destination')}
              >
                Seleccionar destino
              </Button>
            )}
            <p
              className={`font-semibold ${busLineStep === 'select-destination' ? 'text-blue-800' : ''}`}
            >
              Destino:
            </p>
            <div
              className={getStopStyle(destinationStop?.stop?.properties?.id)}
            >
              {selectedStops.has(destinationStop?.stop?.properties?.id) ? (
                <>
                  <p>
                    {
                      selectedStops.get(destinationStop.stop?.properties?.id)
                        ?.properties.name
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {
                      selectedStops.get(destinationStop.stop?.properties?.id)
                        ?.properties.description
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Refugio:{' '}
                    {selectedStops.get(destinationStop.stop?.properties?.id)
                      ?.properties.hasShelter
                      ? 'Sí'
                      : 'No'}
                  </p>

                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium">
                        Horarios estimados:
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimatedTime('destination')}
                      >
                        + Agregar horario
                      </Button>
                    </div>
                    {destinationStop.estimatedTimes.map((time, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          type="time"
                          value={time ? time.substring(0, 5) : ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateEstimatedTime(
                              'destination',
                              index,
                              e.target.value,
                            )
                          }
                          className="border-black flex-1"
                        />
                        {destinationStop.estimatedTimes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeEstimatedTime('destination', index)
                            }
                          >
                            ❌
                          </Button>
                        )}
                      </div>
                    ))}
                    {destinationStop.estimatedTimes.length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addEstimatedTime('destination')}
                      >
                        Agregar primer horario
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                '⬜ No seleccionado'
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={
              !originStop?.stop ||
              !destinationStop?.stop ||
              originStop?.estimatedTimes?.length === 0 ||
              destinationStop?.estimatedTimes?.length === 0 ||
              intermediateStops.some(
                (stop) => !stop.stop || stop.estimatedTimes?.length === 0,
              ) ||
              !areStopTimesOrdered()
            }
            onClick={(e) => handleSave(e)}
          >
            Guardar
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

export default StopAssignmentDrawer
