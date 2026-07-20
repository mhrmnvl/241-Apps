export interface TimeSlotSavePayload {
  name: string
  startTime: string
  endTime: string
  order: number
  typeId: string
}

export interface TimeSlotQueryParams {
  page?: number
  limit?: number
  search?: string
}
