import { toast } from 'react-toastify'
import { getByStop } from './busLines'
import { _getStops, updateStop } from './busStops'
import type { BusStopFeature } from '@/models/geoserver'
import type { BusStopLine } from '@/models/database'

/**
 * Handles updating stop status when stops become orphaned (no longer assigned to any active bus line)
 * @param deletedAssociations Array of stop-line associations that were deleted
 * @returns Promise<boolean> Returns true if any stops were orphaned
 */
export async function handleOrphanedStops(
  deletedAssociations: Array<BusStopLine>
): Promise<boolean> {
  let someOrphaned = false

  for (const association of deletedAssociations) {
    const remainingAssociations = await getByStop(String(association.stopId))
    
    if (remainingAssociations.length === 0 || remainingAssociations.every((assoc) => assoc.isEnabled === false)) {
      const stopFeatures = await _getStops(`id = ${association.stopId}`)
      if (!stopFeatures || stopFeatures.length === 0) continue

      const stop = stopFeatures[0]
      stop.properties.status = 'INACTIVE'
      someOrphaned = true

      await updateStop({
        ...stop.properties,
        geometry: stop.geometry,
      })
    }
  }

  if (someOrphaned) {
    toast.warning('Algunas paradas quedaron huérfanas', {
      autoClose: 8000,
    })
  }

  return someOrphaned
}

/**
 * Activates stops that are now assigned to bus lines
 * @param stops Array of stops with their features to activate
 */
export async function activateAssignedStops(
  stops: Array<{ stop: BusStopFeature | null }>
): Promise<void> {
  for (const stop of stops) {
    if (!stop.stop || stop.stop.properties.status === 'ACTIVE') continue

    stop.stop.properties.status = 'ACTIVE'
    await updateStop({
      ...stop.stop.properties,
      geometry: stop.stop.geometry,
    })
  }
}

/**
 * Handles all stop status updates after saving stop assignments
 * @param deletedAssociations Associations that were deleted
 * @param assignedStops Stops that are now assigned
 * @returns Promise<boolean> Returns true if any stops were orphaned
 */
export async function updateStopStatuses(
  deletedAssociations: Array<BusStopLine>,
  assignedStops: Array<{ stop: BusStopFeature | null }>
): Promise<boolean> {
  // Handle orphaned stops first
  const hasOrphanedStops = await handleOrphanedStops(deletedAssociations)

  // Then activate assigned stops
  await activateAssignedStops(assignedStops)

  return hasOrphanedStops
}

/**
 * Handles stop status updates after a bus line is deleted
 * @param deletedStopAssociations Array of stop associations from the deleted bus line
 */
export async function handleStopStatusAfterBusLineDeletion(
  deletedStopAssociations: Array<BusStopLine>
): Promise<void> {
  for (const stop of deletedStopAssociations) {
    const remainingAssociations = await getByStop(stop.stopId)
    
    if (remainingAssociations.length === 0 || remainingAssociations.every((assoc) => assoc.isEnabled === false)) {
      const stopData = await _getStops(`id=${stop.stopId}`)
      if (!stopData || !stopData.length) continue
      
      stopData[0].properties.status = 'INACTIVE'
      await updateStop({
        ...stopData[0].properties,
        geometry: stopData[0].geometry,
      })
    }
  }
}

/**
 * Handles stop status updates when a bus line is created or updated with INACTIVE status
 * @param busLineStatus The status of the bus line ('ACTIVE' | 'INACTIVE')
 * @param assignedStops Stops that are assigned to this bus line
 * @param busLineId Optional bus line ID to exclude when checking for active associations (for editing scenarios)
 */
export async function updateStopStatusesForBusLineStatus(
  busLineStatus: 'ACTIVE' | 'INACTIVE',
  assignedStops: Array<{ stop: BusStopFeature | null }>,
  busLineId?: string | number
): Promise<void> {
  if (busLineStatus === 'INACTIVE') {
    for (const stop of assignedStops) {
      if (!stop.stop) continue
      
      const remainingAssociations = await getByStop(String(stop.stop.properties.id))
      
      const otherAssociations = busLineId 
        ? remainingAssociations.filter(assoc => String(assoc.lineId) !== String(busLineId))
        : remainingAssociations
      
      const hasActiveAssociations = otherAssociations.some((assoc) => assoc.isEnabled === true)
      
      if (!hasActiveAssociations) {
        stop.stop.properties.status = 'INACTIVE'
        await updateStop({
          ...stop.stop.properties,
          geometry: stop.stop.geometry,
        })
      }
    }
  } else {
    await activateAssignedStops(assignedStops)
  }
}

/**
 * Enhanced version of updateStopStatuses that considers bus line status
 * @param deletedAssociations Associations that were deleted
 * @param assignedStops Stops that are now assigned
 * @param busLineStatus The status of the bus line being created/updated
 * @param busLineId The ID of the bus line being created/updated
 * @returns Promise<boolean> Returns true if any stops were orphaned
 */
export async function updateStopStatusesWithBusLineStatus(
  deletedAssociations: Array<BusStopLine>,
  assignedStops: Array<{ stop: BusStopFeature | null }>,
  busLineStatus: 'ACTIVE' | 'INACTIVE',
  busLineId?: string | number
): Promise<boolean> {
  const hasOrphanedStops = await handleOrphanedStops(deletedAssociations)

  await updateStopStatusesForBusLineStatus(busLineStatus, assignedStops, busLineId)

  return hasOrphanedStops
}

/**
 * Handles stop status updates specifically for bus line creation
 * Considers the initial status of the bus line and updates stop statuses accordingly
 * @param assignedStops Stops that are assigned to the newly created bus line
 * @param busLineStatus The status of the newly created bus line
 * @param busLineId Optional bus line ID (for editing scenarios)
 */
export async function updateStopStatusesForNewBusLine(
  assignedStops: Array<{ stop: BusStopFeature | null }>,
  busLineStatus: 'ACTIVE' | 'INACTIVE',
  busLineId?: string | number
): Promise<void> {
  await updateStopStatusesForBusLineStatus(busLineStatus, assignedStops, busLineId)
}
