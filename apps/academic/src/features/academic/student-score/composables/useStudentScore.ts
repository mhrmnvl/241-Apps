import { storeToRefs } from 'pinia'
import { studentScoreService } from '../services/studentScoreService'
import { useStudentScoreStore } from '../stores/studentScoreStore'

export function useStudentScore() {
  const store = useStudentScoreStore()
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
    assessmentItems,
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
    assessmentItems,
    fetchAll: studentScoreService.fetchAll,
    fetchRelatedData: studentScoreService.fetchRelatedData,
    saveScores: studentScoreService.saveScores,
    saveAssessmentItem: studentScoreService.saveAssessmentItem,
    deleteAssessmentItem: studentScoreService.deleteAssessmentItem,
  }
}
