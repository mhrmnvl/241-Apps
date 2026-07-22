import { storeToRefs } from 'pinia'
import { assessmentItemService } from '../services/assessmentItemService'
import { useAssessmentItemStore } from '../stores/assessmentItemStore'

export function useAssessmentItem() {
  const store = useAssessmentItemStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    semesters,
    selectedClassroomId,
    selectedSubjectId,
    selectedSemesterId,
    teachingAssignment,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    subjects,
    semesters,
    selectedClassroomId,
    selectedSubjectId,
    selectedSemesterId,
    teachingAssignment,
    fetchRelatedData: assessmentItemService.fetchRelatedData,
    fetchItems: assessmentItemService.fetchItems,
    saveItem: assessmentItemService.saveItem,
    deleteItem: assessmentItemService.deleteItem,
  }
}
