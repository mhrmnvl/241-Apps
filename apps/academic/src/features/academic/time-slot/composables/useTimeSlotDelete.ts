import { timeSlotService } from '../services/timeSlotService'

export function useTimeSlotDelete() {
  return {
    deleteTimeSlot: timeSlotService.deleteTimeSlot,
  }
}
