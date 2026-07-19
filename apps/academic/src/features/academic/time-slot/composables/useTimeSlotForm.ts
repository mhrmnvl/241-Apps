import { storeToRefs } from 'pinia'
import { useTimeSlotStore } from '../stores/timeSlotStore'
import { timeSlotService } from '../services/timeSlotService'

export function useTimeSlotForm() {
  const store = useTimeSlotStore()
  const { isSaving, formError } = storeToRefs(store)

  return {
    isSaving,
    formError,
    saveTimeSlot: timeSlotService.saveTimeSlot,
  }
}
