export interface TimeSlotType {
  id: string
  code: string
  name: string
}

export interface TimeSlot {
  id: string
  name: string
  startTime: string
  endTime: string
  order: number
  typeId: string
  type: TimeSlotType
}
