export type TimeSlotType = 'LESSON' | 'BREAK' | 'CEREMONY' | 'TAHFIDZ'

export interface TimeSlot {
  id: string
  name: string
  startTime: string
  endTime: string
  order: number
  type: TimeSlotType
}
