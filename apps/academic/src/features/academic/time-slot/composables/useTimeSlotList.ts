import { storeToRefs } from 'pinia'
import { useTimeSlotStore } from '../stores/timeSlotStore'
import { timeSlotService } from '../services/timeSlotService'

export function useTimeSlotList() {
  const store = useTimeSlotStore()
  const { timeSlots, totalTimeSlots, loading } = storeToRefs(store)

  return {
    timeSlots,
    totalTimeSlots,
    loading,
    fetchTimeSlots: timeSlotService.fetchTimeSlots,
  }
}
