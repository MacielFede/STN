export type BusStopProperties = {
  id: number
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  hasShelter: boolean
}


export type BusLineProperties = {

  id: number
  number: string
  status: 'ACTIVE' | 'INACTIVE'
  origin: string
  destination: string
  companyId: number
}
