export type BusStopProperties = {
  id: number
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  hasShelter: boolean
}
