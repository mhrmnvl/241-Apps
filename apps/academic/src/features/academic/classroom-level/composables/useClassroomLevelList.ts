import { storeToRefs } from 'pinia'
import { classroomLevelService } from '../services/classroomLevelService'
import { useClassroomLevelStore } from '../stores/classroomLevelStore'

export function useClassroomLevelList() {
  const store = useClassroomLevelStore()
  const { items, totalItems, loading } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    fetchClassroomLevels: classroomLevelService.fetchClassroomLevels,
    deleteClassroomLevel: classroomLevelService.deleteClassroomLevel,
  }
}
