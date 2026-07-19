import type { TimeSlotType } from './time-slot'

export interface TimeSlotSavePayload {
  name: string
  startTime: string
  endTime: string
  order: number
  type: TimeSlotType
}

export interface TimeSlotQueryParams {
  page?: number
  limit?: number
  search?: string
}
