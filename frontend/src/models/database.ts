export type BusStopProperties = {
  id: number
  name: string
  description: string
  status: 'active' | 'inactive'
  sheltered: boolean
}
